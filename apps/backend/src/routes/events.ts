import { Router } from 'express';
import multer from 'multer';
import { createEvents } from 'ics';
import ICAL from 'ical.js';
import { requireAuth } from '../middleware/auth.js';
import { expandOccurrences } from '../services/recurrence.js';
import { LocalStorageAdapter } from '../services/storage.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/errors.js';
import { prisma } from '../utils/prisma.js';
import { eventSchema, eventsListQuerySchema, eventUpdateSchema, idParamSchema, queryRangeSchema, recurrenceSchema } from '../utils/schemas.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const storage = new LocalStorageAdapter();
const remindersPayloadError = 'Invalid reminders payload. Provide a JSON array of minutes.';
const invalidIcsPayloadError = 'Invalid ICS file.';

const parseRemindersInput = (raw: unknown): unknown[] => {
  if (raw === undefined || raw === null || raw === '') {
    return [];
  }

  if (Array.isArray(raw)) {
    return raw;
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        throw new AppError(400, remindersPayloadError);
      }
      return parsed;
    } catch {
      throw new AppError(400, remindersPayloadError);
    }
  }

  throw new AppError(400, remindersPayloadError);
};

const parseIcsEvents = (raw: string): ICAL.Component[] => {
  try {
    const jcalData = ICAL.parse(raw);
    const vcalendar = new ICAL.Component(jcalData);
    return vcalendar.getAllSubcomponents('vevent');
  } catch {
    throw new AppError(400, invalidIcsPayloadError);
  }
};

export const eventsRouter = Router();
eventsRouter.use(requireAuth);

eventsRouter.get('/export/ics', asyncHandler(async (req, res) => {
  const { from, to } = queryRangeSchema.parse({ from: req.query.from, to: req.query.to });
  const events = await prisma.event.findMany({ where: { userId: req.user!.id, startAt: { gte: from }, endAt: { lte: to } } });
  const value = await new Promise<string>((resolve, reject) => {
    createEvents(events.map((e: { title: string; description: string | null; startAt: Date; endAt: Date }) => ({ title: e.title, description: e.description ?? '', start: [e.startAt.getUTCFullYear(), e.startAt.getUTCMonth() + 1, e.startAt.getUTCDate(), e.startAt.getUTCHours(), e.startAt.getUTCMinutes()], end: [e.endAt.getUTCFullYear(), e.endAt.getUTCMonth() + 1, e.endAt.getUTCDate(), e.endAt.getUTCHours(), e.endAt.getUTCMinutes()] })), (err, result) => {
      if (err || !result) {
        return reject(new AppError(500, 'Failed to export ICS'));
      }
      resolve(result);
    });
  });
  res.type('text/calendar').send(value);
}));

eventsRouter.post('/import/ics', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError(400, 'ICS file is required');
  const vevents = parseIcsEvents(req.file.buffer.toString('utf-8'));
  const created: string[] = [];
  for (const comp of vevents) {
    const event = new ICAL.Event(comp);
    const startAt = event.startDate.toJSDate();
    const endAt = event.endDate.toJSDate();
    if (!(endAt > startAt)) throw new AppError(400, 'Event end date must be after start date.');
    if (startAt.getUTCFullYear() < 2000 || endAt.getUTCFullYear() > 2099) throw new AppError(400, 'Date must be between 2000-01-01 and 2099-12-31.');
    const record = await prisma.event.create({ data: { userId: req.user!.id, title: event.summary || 'Imported Event', startAt, endAt, description: event.description || undefined, location: event.location || undefined } });
    created.push(record.id);
  }
  res.json({ imported: created.length, ids: created });
}));

eventsRouter.get('/', asyncHandler(async (req, res) => {
  const { page, limit, q, category, from, to } = eventsListQuerySchema.parse(req.query);
  const events = await prisma.event.findMany({
    where: {
      userId: req.user!.id,
      ...(category ? { categoryId: category } : {}),
      ...(q ? { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }, { location: { contains: q, mode: 'insensitive' } }] } : {}),
      ...(from && to ? { startAt: { gte: from }, endAt: { lte: to } } : {})
    },
    include: { recurrence: true, reminders: true, attachments: true },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { startAt: 'asc' }
  });
  res.json(events);
}));

eventsRouter.post('/', upload.array('attachments', 4), asyncHandler(async (req, res) => {
  const body = eventSchema.parse({ ...req.body, reminders: parseRemindersInput(req.body.reminders) });
  const files = (req.files as Express.Multer.File[]) ?? [];
  for (const file of files) {
    if (!['image/png', 'image/jpeg', 'application/pdf'].includes(file.mimetype)) throw new AppError(400, 'Unsupported attachment type');
  }
  const event = await prisma.event.create({ data: { ...body, userId: req.user!.id, reminders: { create: body.reminders.map((m) => ({ minutesBefore: m })) } }, include: { reminders: true } });
  for (const file of files) {
    const storagePath = await storage.save(file);
    await prisma.attachment.create({ data: { eventId: event.id, filename: file.originalname, mimetype: file.mimetype, size: file.size, storagePath } });
  }
  res.status(201).json(await prisma.event.findUnique({ where: { id: event.id }, include: { reminders: true, attachments: true, recurrence: true } }));
}));

eventsRouter.get('/:id', asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const event = await prisma.event.findFirst({ where: { id, userId: req.user!.id }, include: { reminders: true, attachments: true, recurrence: true } });
  if (!event) throw new AppError(404, 'Event not found');
  res.json(event);
}));

eventsRouter.put('/:id', asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const body = eventUpdateSchema.parse(req.body);
  const event = await prisma.event.findFirst({ where: { id, userId: req.user!.id } });
  if (!event) throw new AppError(404, 'Event not found');
  const updated = await prisma.event.update({ where: { id: event.id }, data: { ...body }, include: { recurrence: true, reminders: true } });
  res.json(updated);
}));

eventsRouter.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await prisma.event.deleteMany({ where: { id, userId: req.user!.id } });
  res.json({ message: 'Deleted' });
}));

eventsRouter.post('/:id/recurrence', asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const body = recurrenceSchema.parse(req.body);
  const event = await prisma.event.findFirst({ where: { id, userId: req.user!.id } });
  if (!event) throw new AppError(404, 'Event not found');
  const recurrence = await prisma.eventRecurrence.upsert({ where: { eventId: event.id }, update: body, create: { ...body, eventId: event.id } });
  res.status(201).json(recurrence);
}));

eventsRouter.get('/:id/occurrences', asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const { from, to } = queryRangeSchema.parse({ from: req.query.from, to: req.query.to });
  const event = await prisma.event.findFirst({ where: { id, userId: req.user!.id }, include: { recurrence: true } });
  if (!event) throw new AppError(404, 'Event not found');
  res.json({ occurrences: expandOccurrences(event, from, to) });
}));
