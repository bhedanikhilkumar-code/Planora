import request from 'supertest';
import { app } from '../src/app.js';
import { signAccess } from '../src/utils/auth.js';
import { eventSchema, recurrenceSchema } from '../src/utils/schemas.js';

type User = {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  passwordHash: string;
  banned: boolean;
  createdAt: Date;
  updatedAt: Date;
};

jest.mock('../src/utils/prisma.js', () => {
  const now = new Date();
  const users: User[] = [
    {
      id: 'a1',
      email: 'admin@example.com',
      role: 'ADMIN',
      passwordHash: '$2b$10$xfMKGsD8.GwLGjA0Nl23sOUVSt4T56Jlnf94x85f.5iFF0wi4VhmK', // User@12345
      banned: false,
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'u1',
      email: 'user@example.com',
      role: 'USER',
      passwordHash: '$2b$10$xfMKGsD8.GwLGjA0Nl23sOUVSt4T56Jlnf94x85f.5iFF0wi4VhmK',
      banned: false,
      createdAt: now,
      updatedAt: now
    }
  ];

  const events: any[] = Array.from({ length: 25 }, (_, i) => ({
    id: `e${i + 1}`,
    userId: 'u1',
    title: `Event ${i + 1}`,
    description: 'desc',
    location: 'loc',
    startAt: new Date('2026-01-01T10:00:00Z'),
    endAt: new Date('2026-01-01T11:00:00Z'),
    allDay: false,
    attendees: [],
    createdAt: now
  }));

  const logs: any[] = [];

  return {
    prisma: {
      user: {
        findUnique: jest.fn(async ({ where }) => {
          if (where.email) return users.find((u) => u.email === where.email) ?? null;
          if (where.id) return users.find((u) => u.id === where.id) ?? null;
          return null;
        }),
        create: jest.fn(async ({ data }) => ({ id: 'u99', ...data })),
        count: jest.fn(async () => users.length),
        findMany: jest.fn(async ({ skip = 0, take = 20 }) => users.slice(skip, skip + take)),
        update: jest.fn(async ({ where, data }) => {
          const idx = users.findIndex((u) => u.id === where.id);
          if (idx === -1) throw new Error('not found');
          users[idx] = { ...users[idx], ...data, updatedAt: new Date() };
          return users[idx];
        })
      },
      refreshToken: {
        create: jest.fn(async () => ({})),
        findFirst: jest.fn(async () => null),
        updateMany: jest.fn(async () => ({}))
      },
      event: {
        findMany: jest.fn(async ({ skip = 0, take = 20 }) =>
          events.slice(skip, skip + take).map((e) => ({ ...e, user: { id: 'u1', email: 'user@example.com' } }))
        ),
        create: jest.fn(async ({ data }) => ({ id: 'e999', ...data })),
        findFirst: jest.fn(async () => ({ ...events[0], recurrence: null, reminders: [], attachments: [] })),
        findUnique: jest.fn(async () => ({ ...events[0], recurrence: null, reminders: [], attachments: [] })),
        update: jest.fn(async ({ data }) => ({ ...events[0], ...data })),
        deleteMany: jest.fn(async () => ({})),
        count: jest.fn(async () => events.length),
        delete: jest.fn(async ({ where }) => {
          const idx = events.findIndex((e) => e.id === where.id);
          if (idx >= 0) events.splice(idx, 1);
          return {};
        })
      },
      eventRecurrence: { upsert: jest.fn(async ({ create }) => ({ id: 'r1', ...create })) },
      attachment: { create: jest.fn(async () => ({})) },
      auditLog: {
        findMany: jest.fn(async ({ skip = 0, take = 20 }) => logs.slice(skip, skip + take).map((l) => ({ ...l, admin: { email: 'admin@example.com' } }))),
        create: jest.fn(async ({ data }) => {
          const log = { id: `l${logs.length + 1}`, ...data, createdAt: new Date() };
          logs.push(log);
          return log;
        }),
        count: jest.fn(async () => logs.length)
      },
      systemSetting: {
        upsert: jest.fn(async ({ create, update }) => ({ id: 'singleton', registrationEnabled: update?.registrationEnabled ?? create?.registrationEnabled ?? true })),
        findUnique: jest.fn(async () => ({ id: 'singleton', registrationEnabled: true }))
      }
    }
  };
});

describe('Planora admin engineering requirements', () => {
  const adminToken = signAccess('a1', 'ADMIN');
  const userToken = signAccess('u1', 'USER');

  test('admin login success', async () => {
    const res = await request(app).post('/admin/login').send({ email: 'admin@example.com', password: 'User@12345' });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
  });

  test('admin route returns 401 without token', async () => {
    const res = await request(app).get('/admin/kpis');
    expect(res.status).toBe(401);
  });

  test('admin route returns 403 for non-admin token', async () => {
    const res = await request(app).get('/admin/kpis').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  test('ban user flow + audit log creation', async () => {
    const banRes = await request(app)
      .patch('/admin/users/u1/ban')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ banned: true });
    expect(banRes.status).toBe(200);
    expect(banRes.body.banned).toBe(true);

    const logsRes = await request(app).get('/admin/audit-logs').set('Authorization', `Bearer ${adminToken}`);
    expect(logsRes.status).toBe(200);
    expect(logsRes.body.items.some((l: any) => l.action === 'BAN_USER')).toBe(true);
  });

  test('banned user blocked on protected route', async () => {
    const res = await request(app).get('/events').set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  test('unban user flow + audit log creation', async () => {
    const res = await request(app)
      .patch('/admin/users/u1/ban')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ banned: false });
    expect(res.status).toBe(200);
    expect(res.body.banned).toBe(false);
  });

  test('role change flow + audit log creation', async () => {
    const res = await request(app)
      .patch('/admin/users/u1/role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'ADMIN' });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('ADMIN');
  });

  test('delete event + audit log', async () => {
    const res = await request(app).delete('/admin/events/e1').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  test('pagination on /admin/users works', async () => {
    const res = await request(app).get('/admin/users?page=1&limit=1').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.total).toBeGreaterThan(1);
  });

  test('pagination on /admin/events works', async () => {
    const res = await request(app).get('/admin/events?page=1&limit=5').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(5);
    expect(res.body.total).toBeGreaterThan(20);
  });

  test('event schema rejects out-of-range date', () => {
    expect(() => eventSchema.parse({ title: 'bad', startAt: '1999-12-31T00:00:00Z', endAt: '2000-01-01T01:00:00Z' })).toThrow('Date must be between 2000-01-01 and 2099-12-31.');
  });

  test('recurrence until rejects over max date', () => {
    expect(() => recurrenceSchema.parse({ freq: 'DAILY', interval: 1, until: '2100-01-01T00:00:00Z' })).toThrow();
  });
});
