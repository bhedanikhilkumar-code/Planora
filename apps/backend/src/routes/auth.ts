import { Router } from 'express';
import crypto from 'node:crypto';
import { authRateLimit } from '../middleware/rateLimit.js';
import { comparePassword, hashPassword, signAccess, signRefresh, verifyRefresh } from '../utils/auth.js';
import { AppError } from '../utils/errors.js';
import { prisma } from '../utils/prisma.js';
import { loginSchema, registerSchema, resetSchema } from '../utils/schemas.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { userProfileSelect } from '../utils/selects.js';

const resetStore = new Map<string, string>();
export const authRouter = Router();
authRouter.use(authRateLimit);

authRouter.post('/register', asyncHandler(async (req, res) => {
  const body = registerSchema.parse(req.body);
  const setting = await prisma.systemSetting.findUnique({ where: { id: 'singleton' } });
  if (setting && !setting.registrationEnabled) throw new AppError(403, 'Registration is currently disabled.');
  const exists = await prisma.user.findUnique({ where: { email: body.email } });
  if (exists) throw new AppError(409, 'Email already registered');
  const user = await prisma.user.create({ data: { email: body.email, passwordHash: await hashPassword(body.password) } });
  return res.status(201).json({ id: user.id, email: user.email });
}));

authRouter.post('/login', asyncHandler(async (req, res) => {
  const body = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || !(await comparePassword(body.password, user.passwordHash))) throw new AppError(401, 'Invalid credentials');
  if (user.banned) throw new AppError(403, 'Account is banned');
  const accessToken = signAccess(user.id, user.role);
  const refreshToken = signRefresh(user.id);
  await prisma.refreshToken.create({ data: { userId: user.id, tokenHash: crypto.createHash('sha256').update(refreshToken).digest('hex'), expiresAt: new Date(Date.now() + 7 * 86400000) } });
  res.json({ accessToken, refreshToken });
}));

authRouter.post('/refresh', asyncHandler(async (req, res) => {
  const token = String(req.body.refreshToken ?? '');
  const payload = verifyRefresh(token);
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  const dbToken = await prisma.refreshToken.findFirst({ where: { userId: payload.sub, tokenHash: hash, revoked: false, expiresAt: { gt: new Date() } }, include: { user: true } });
  if (!dbToken) throw new AppError(401, 'Invalid refresh token');
  res.json({ accessToken: signAccess(dbToken.user.id, dbToken.user.role) });
}));

authRouter.post('/logout', asyncHandler(async (req, res) => {
  const token = String(req.body.refreshToken ?? '');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  await prisma.refreshToken.updateMany({ where: { tokenHash: hash }, data: { revoked: true } });
  res.json({ message: 'Logged out' });
}));

authRouter.post('/forgot-password', asyncHandler(async (req, res) => {
  const email = String(req.body.email ?? '');
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = crypto.randomBytes(24).toString('hex');
    resetStore.set(token, user.id);
  }
  res.json({ message: 'If the account exists, reset instructions were generated.' });
}));

authRouter.post('/reset-password', asyncHandler(async (req, res) => {
  const body = resetSchema.parse(req.body);
  const userId = resetStore.get(body.token);
  if (!userId) throw new AppError(400, 'Invalid reset token');
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(body.password) } });
  resetStore.delete(body.token);
  res.json({ message: 'Password reset successfully' });
}));

authRouter.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: userProfileSelect });
  res.json(user);
}));
