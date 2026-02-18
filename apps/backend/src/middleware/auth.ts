import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors.js';
import { verifyAccess } from '../utils/auth.js';
import { prisma } from '../utils/prisma.js';

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) throw new AppError(401, 'Unauthorized');

  const token = auth.replace('Bearer ', '');
  const payload = verifyAccess(token);

  const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, role: true, banned: true } });
  if (!user) throw new AppError(401, 'Unauthorized');
  if (user.banned) throw new AppError(403, 'Account is banned');

  req.user = { id: user.id, role: user.role };
  next();
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) throw new AppError(401, 'Unauthorized');
  if (req.user.role !== 'ADMIN') throw new AppError(403, 'Admin access required');
  next();
};
