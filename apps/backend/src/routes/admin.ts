import crypto from 'node:crypto';
import { Router } from 'express';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { adminLoginRateLimit } from '../middleware/rateLimit.js';
import { audit } from '../services/audit.js';
import { comparePassword, hashPassword, signAccess } from '../utils/auth.js';
import { AppError } from '../utils/errors.js';
import { prisma } from '../utils/prisma.js';
import {
  adminAuditQuerySchema,
  adminEventsQuerySchema,
  adminLoginSchema,
  adminRoleSchema,
  adminSettingsSchema,
  adminUserActionSchema,
  adminUserQuerySchema,
  idParamSchema
} from '../utils/schemas.js';

export const adminRouter = Router();

adminRouter.post('/login', adminLoginRateLimit, async (req, res) => {
  const { email, password } = adminLoginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== 'ADMIN' || !(await comparePassword(password, user.passwordHash))) {
    throw new AppError(401, 'Invalid admin credentials');
  }
  if (user.banned) throw new AppError(403, 'Admin account is banned');
  res.json({ accessToken: signAccess(user.id, user.role) });
});

adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/kpis', async (_req, res) => {
  const now = Date.now();
  const [totalUsers, activeUsers, dailyEvents, weeklyEvents] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { updatedAt: { gte: new Date(now - 7 * 86400000) } } }),
    prisma.event.count({ where: { createdAt: { gte: new Date(now - 86400000) } } }),
    prisma.event.count({ where: { createdAt: { gte: new Date(now - 7 * 86400000) } } })
  ]);
  res.json({ totalUsers, activeUsers, dailyEvents, weeklyEvents });
});

adminRouter.get('/users', async (req, res) => {
  const { search, page, limit } = adminUserQuerySchema.parse(req.query);
  const where = search ? { email: { contains: search, mode: 'insensitive' as const } } : {};
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, email: true, role: true, banned: true, createdAt: true, updatedAt: true }
    }),
    prisma.user.count({ where })
  ]);

  res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
});

adminRouter.get('/users/:id', async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      banned: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { events: true } }
    }
  });
  if (!user) throw new AppError(404, 'User not found');
  res.json(user);
});

adminRouter.patch('/users/:id/ban', async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const { banned } = adminUserActionSchema.parse(req.body);
  const user = await prisma.user.update({ where: { id }, data: { banned } });
  await audit(req.user!.id, banned ? 'BAN_USER' : 'UNBAN_USER', 'USER', user.id, req.ip, { banned });
  res.json({ id: user.id, banned: user.banned });
});

adminRouter.patch('/users/:id/role', async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const { role } = adminRoleSchema.parse(req.body);
  const user = await prisma.user.update({ where: { id }, data: { role } });
  await audit(req.user!.id, 'CHANGE_ROLE', 'USER', user.id, req.ip, { role });
  res.json({ id: user.id, role: user.role });
});

adminRouter.post('/users/:id/reset-password', async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const tempPassword = `Tmp-${crypto.randomBytes(6).toString('hex')}`;
  await prisma.user.update({ where: { id }, data: { passwordHash: await hashPassword(tempPassword) } });
  await audit(req.user!.id, 'RESET_PASSWORD', 'USER', id, req.ip);
  res.json({ message: 'Temporary password generated', tempPassword });
});

adminRouter.get('/events', async (req, res) => {
  const { page, limit, from, to, q } = adminEventsQuerySchema.parse(req.query);
  const where = {
    ...(from && to ? { startAt: { gte: from }, endAt: { lte: to } } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' as const } },
            { description: { contains: q, mode: 'insensitive' as const } },
            { location: { contains: q, mode: 'insensitive' as const } }
          ]
        }
      : {})
  };

  const [items, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: { user: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.event.count({ where })
  ]);

  res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
});

adminRouter.delete('/events/:id', async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await prisma.event.delete({ where: { id } });
  await audit(req.user!.id, 'DELETE_EVENT', 'EVENT', id, req.ip);
  res.json({ message: 'Event removed' });
});

adminRouter.get('/audit-logs', async (req, res) => {
  const { page, limit, action, from, to, admin } = adminAuditQuerySchema.parse(req.query);
  const where = {
    ...(action ? { action } : {}),
    ...(admin ? { adminId: admin } : {}),
    ...(from && to ? { createdAt: { gte: from, lte: to } } : {})
  };

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { admin: { select: { email: true } } }
    }),
    prisma.auditLog.count({ where })
  ]);

  res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
});

adminRouter.get('/settings', async (_req, res) => {
  const settings = await prisma.systemSetting.upsert({ where: { id: 'singleton' }, create: { id: 'singleton' }, update: {} });
  res.json(settings);
});

adminRouter.patch('/settings', async (req, res) => {
  const { registrationEnabled } = adminSettingsSchema.parse(req.body);
  const settings = await prisma.systemSetting.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', registrationEnabled },
    update: { registrationEnabled }
  });

  await audit(req.user!.id, 'UPDATE_SETTINGS', 'SYSTEM', 'singleton', req.ip, { registrationEnabled });
  res.json(settings);
});
