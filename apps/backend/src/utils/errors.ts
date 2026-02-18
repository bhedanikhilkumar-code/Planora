import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const errorMiddleware = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'ValidationError', message: err.issues.map((i) => i.message).join(', ') });
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: 'AppError', message: err.message });
  }
  return res.status(500).json({ error: 'InternalServerError', message: err.message || 'Unexpected error' });
};
