import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { adminRouter } from './routes/admin.js';
import { authRouter } from './routes/auth.js';
import { eventsRouter } from './routes/events.js';
import { env } from './config/env.js';
import { errorMiddleware } from './utils/errors.js';
import { requireAuth } from './middleware/auth.js';
import { prisma } from './utils/prisma.js';

export const app = express();
app.use(helmet());
app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, email: true, role: true, timezone: true, weekStartsOn: true, hourFormat24: true } });
  res.json(user);
});
app.use('/auth', authRouter);
app.use('/events', eventsRouter);
app.use('/admin', adminRouter);

app.use(errorMiddleware);
