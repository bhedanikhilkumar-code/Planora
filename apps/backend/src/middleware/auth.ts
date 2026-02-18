import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors.js';
import { verifyAccess } from '../utils/auth.js';

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) throw new AppError(401, 'Unauthorized');
  const token = auth.replace('Bearer ', '');
  const payload = verifyAccess(token);
  req.user = { id: payload.sub, role: payload.role };
  next();
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') throw new AppError(403, 'Admin access required');
  next();
};
