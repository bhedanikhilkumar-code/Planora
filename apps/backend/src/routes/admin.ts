import { Role } from '@prisma/client';
import { Router } from 'express';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { audit } from '../services/audit.js';
import { comparePassword, signAccess } from '../utils/auth.js';
import { AppError } from '../utils/errors.js';
import { prisma } from '../utils/prisma.js';

export const adminRouter = Router();

adminRouter.post('/login', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== 'ADMIN' || !(await comparePassword(password, user.passwordHash))) throw new AppError(401, 'Invalid admin credentials');
  res.json({ accessToken: signAccess(user.id, user.role) });
});

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/kpis', async (_req, res) => {
  const [totalUsers, activeUsers, dailyEvents, weeklyEvents] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { updatedAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
    prisma.event.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
    prisma.event.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 86400000) } } })
  ]);
  res.json({ totalUsers, activeUsers, dailyEvents, weeklyEvents });
});

adminRouter.get('/users', async (req, res) => {
  const q = String(req.query.q ?? '');
  const users = await prisma.user.findMany({ where: q ? { email: { contains: q, mode: 'insensitive' } } : {}, orderBy: { createdAt: 'desc' } });
  res.json(users);
});

adminRouter.patch('/users/:id/ban', async (req, res) => {
  const { banned } = req.body as { banned: boolean };
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { banned } });
  await audit(req.user!.id, banned ? 'BAN_USER' : 'UNBAN_USER', 'USER', user.id, req.ip);
  res.json(user);
});

adminRouter.patch('/users/:id/role', async (req, res) => {
  const { role } = req.body as { role: Role };
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { role } });
  await audit(req.user!.id, 'CHANGE_ROLE', 'USER', user.id, req.ip, { role });
  res.json(user);
});

adminRouter.post('/users/:id/reset-password', async (req, res) => {
  await audit(req.user!.id, 'TRIGGER_PASSWORD_RESET', 'USER', req.params.id, req.ip);
  res.json({ message: 'Password reset action triggered' });
});

adminRouter.get('/audit-logs', async (_req, res) => {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  res.json(logs);
});

adminRouter.get('/events', async (_req, res) => {
  const events = await prisma.event.findMany({ include: { user: { select: { email: true } } }, orderBy: { createdAt: 'desc' } });
  res.json(events);
});

adminRouter.delete('/events/:id', async (req, res) => {
  await prisma.event.delete({ where: { id: req.params.id } });
  await audit(req.user!.id, 'DELETE_EVENT', 'EVENT', req.params.id, req.ip);
  res.json({ message: 'Event removed' });
});

adminRouter.get('/settings', async (_req, res) => {
  const settings = await prisma.systemSetting.upsert({ where: { id: 'singleton' }, create: { id: 'singleton' }, update: {} });
  res.json(settings);
});

adminRouter.patch('/settings', async (req, res) => {
  const { registrationEnabled, emailFrom, backupConfig } = req.body;
  const settings = await prisma.systemSetting.upsert({ where: { id: 'singleton' }, create: { id: 'singleton', registrationEnabled, emailFrom, backupConfig }, update: { registrationEnabled, emailFrom, backupConfig } });
  await audit(req.user!.id, 'UPDATE_SYSTEM_SETTINGS', 'SYSTEM', 'singleton', req.ip);
  res.json(settings);
});
