import request from 'supertest';
import { app } from '../src/app.js';
import { expandOccurrences } from '../src/services/recurrence.js';
import { eventSchema, recurrenceSchema } from '../src/utils/schemas.js';

jest.mock('../src/utils/prisma.js', () => {
  const user = { id: 'u1', email: 'user@example.com', role: 'USER', passwordHash: '$2b$10$zzzzzzzzzzzzzzzzzzzzzu7u3u6k32Q6hV7u9fQANkQ8GHNirMR8G', banned: false };
  const admin = { id: 'a1', email: 'admin@example.com', role: 'ADMIN', passwordHash: '$2b$10$L62j5ql3Ru9M3qqrN8YPuuZHO4DL9Bf7yfdM0y75PJFXjhKJ0MPuK', banned: false };
  const events: any[] = [{ id: 'e1', userId: 'u1', title: 'Test', startAt: new Date('2026-01-01T10:00:00Z'), endAt: new Date('2026-01-01T11:00:00Z'), allDay: false, attendees: [] }];
  const logs: any[] = [];
  return {
    prisma: {
      user: {
        findUnique: jest.fn(async ({ where }) => (where.email === admin.email ? admin : where.email === user.email ? user : null)),
        create: jest.fn(async ({ data }) => ({ id: 'u2', ...data })),
        count: jest.fn(async () => 2),
        findMany: jest.fn(async () => [user, admin]),
        update: jest.fn(async ({ where, data }) => ({ id: where.id, ...data }))
      },
      refreshToken: {
        create: jest.fn(async () => ({})),
        findFirst: jest.fn(async () => null),
        updateMany: jest.fn(async () => ({}))
      },
      event: {
        findMany: jest.fn(async () => events),
        create: jest.fn(async ({ data }) => ({ id: 'e2', ...data })),
        findFirst: jest.fn(async () => ({ ...events[0], recurrence: null, reminders: [], attachments: [] })),
        findUnique: jest.fn(async () => ({ ...events[0], recurrence: null, reminders: [], attachments: [] })),
        update: jest.fn(async ({ data }) => ({ ...events[0], ...data })),
        deleteMany: jest.fn(async () => ({})),
        count: jest.fn(async () => 1),
        delete: jest.fn(async () => ({}))
      },
      eventRecurrence: { upsert: jest.fn(async ({ create }) => ({ id: 'r1', ...create })) },
      attachment: { create: jest.fn(async () => ({})) },
      auditLog: { findMany: jest.fn(async () => logs), create: jest.fn(async ({ data }) => { logs.push(data); return data; }) },
      systemSetting: { upsert: jest.fn(async () => ({ id: 'singleton', registrationEnabled: true })) }
    }
  };
});

describe('Planora API', () => {
  test('health endpoint', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  test('register endpoint', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'new@example.com', password: 'Password123!' });
    expect(res.status).toBe(201);
  });

  test('login invalid credentials', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'unknown@example.com', password: 'badpass123' });
    expect(res.status).toBe(401);
  });

  test('event schema accepts valid in-range date', () => {
    const parsed = eventSchema.parse({ title: 'ok', startAt: '2026-03-01T12:00:00Z', endAt: '2026-03-01T13:00:00Z' });
    expect(parsed.title).toBe('ok');
  });

  test('event schema rejects out-of-range date', () => {
    expect(() => eventSchema.parse({ title: 'bad', startAt: '1999-12-31T00:00:00Z', endAt: '2000-01-01T01:00:00Z' })).toThrow('Date must be between 2000-01-01 and 2099-12-31.');
  });

  test('recurrence until rejects over max date', () => {
    expect(() => recurrenceSchema.parse({ freq: 'DAILY', interval: 1, until: '2100-01-01T00:00:00Z' })).toThrow();
  });

  test('occurrence generation bounded by window', () => {
    const out = expandOccurrences({
      id: 'e1', userId: 'u1', title: 'Test', description: null, startAt: new Date('2026-01-01T10:00:00Z'), endAt: new Date('2026-01-01T11:00:00Z'), allDay: false, location: null, color: null, categoryId: null, attendees: [], createdAt: new Date(), updatedAt: new Date(),
      recurrence: { id: 'r1', eventId: 'e1', freq: 'DAILY', interval: 1, byWeekday: [], byMonthday: [], count: null, until: null }
    } as any, new Date('2026-01-01T00:00:00Z'), new Date('2026-01-03T23:59:59Z'));
    expect(out.length).toBe(3);
  });

  test('admin users unauthorized without token', async () => {
    const res = await request(app).get('/admin/users');
    expect(res.status).toBe(401);
  });

  test('create event unauthorized without token', async () => {
    const res = await request(app).post('/events').send({ title: 'A', startAt: '2026-01-01T10:00:00Z', endAt: '2026-01-01T11:00:00Z' });
    expect(res.status).toBe(401);
  });

  test('validation error on malformed event payload', async () => {
    const res = await request(app).post('/events').set('Authorization', 'Bearer fake').send({ title: '' });
    expect([400, 500]).toContain(res.status);
  });
});
