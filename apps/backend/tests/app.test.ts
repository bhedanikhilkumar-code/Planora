import request from 'supertest';
import { app } from '../src/app.js';
import { signAccess } from '../src/utils/auth.js';
import { eventSchema, recurrenceSchema } from '../src/utils/schemas.js';

jest.mock('../src/utils/prisma.js', () => {
  const user = {
    id: 'u1',
    email: 'user@example.com',
    role: 'USER',
    passwordHash: '$2b$10$xfMKGsD8.GwLGjA0Nl23sOUVSt4T56Jlnf94x85f.5iFF0wi4VhmK',
    banned: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const admin = {
    id: 'a1',
    email: 'admin@example.com',
    role: 'ADMIN',
    passwordHash: '$2b$10$xfMKGsD8.GwLGjA0Nl23sOUVSt4T56Jlnf94x85f.5iFF0wi4VhmK',
    banned: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const events: any[] = [{ id: 'e1', userId: 'u1', title: 'Test', startAt: new Date('2026-01-01T10:00:00Z'), endAt: new Date('2026-01-01T11:00:00Z'), allDay: false, attendees: [] }];
  const logs: any[] = [];
  const users = [user, admin];

  return {
    prisma: {
      user: {
        findUnique: jest.fn(async ({ where }) => users.find((u) => u.email === where.email || u.id === where.id) ?? null),
        create: jest.fn(async ({ data }) => ({ id: 'u2', ...data })),
        count: jest.fn(async () => users.length),
        findMany: jest.fn(async () => users),
        update: jest.fn(async ({ where, data }) => ({ id: where.id, ...data })),
        upsert: jest.fn(async ({ create }) => create)
      },
      refreshToken: {
        create: jest.fn(async () => ({})),
        findFirst: jest.fn(async () => null),
        updateMany: jest.fn(async () => ({}))
      },
      event: {
        findMany: jest.fn(async () => events.map((e) => ({ ...e, user: { id: 'u1', email: 'user@example.com' } }))),
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
      auditLog: {
        findMany: jest.fn(async () => logs),
        create: jest.fn(async ({ data }) => { logs.push({ id: String(logs.length + 1), ...data, createdAt: new Date(), admin: { email: 'admin@example.com' } }); return data; }),
        count: jest.fn(async () => logs.length)
      },
      systemSetting: { upsert: jest.fn(async () => ({ id: 'singleton', registrationEnabled: true })), findUnique: jest.fn(async () => ({ id: 'singleton', registrationEnabled: true })) }
    }
  };
});

describe('Planora API', () => {
  const adminToken = signAccess('a1', 'ADMIN');

  test('health endpoint', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });

  test('admin login success', async () => {
    const res = await request(app).post('/admin/login').send({ email: 'admin@example.com', password: 'User@12345' });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeTruthy();
  });

  test('ban user creates audit log', async () => {
    const res = await request(app).patch('/admin/users/u1/ban').set('Authorization', `Bearer ${adminToken}`).send({ banned: true });
    expect(res.status).toBe(200);
    expect(res.body.banned).toBe(true);
  });

  test('role change endpoint', async () => {
    const res = await request(app).patch('/admin/users/u1/role').set('Authorization', `Bearer ${adminToken}`).send({ role: 'ADMIN' });
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('ADMIN');
  });

  test('delete event endpoint', async () => {
    const res = await request(app).delete('/admin/events/e1').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  test('audit logs list endpoint', async () => {
    const res = await request(app).get('/admin/audit-logs').set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });

  test('event schema rejects out-of-range date', () => {
    expect(() => eventSchema.parse({ title: 'bad', startAt: '1999-12-31T00:00:00Z', endAt: '2000-01-01T01:00:00Z' })).toThrow('Date must be between 2000-01-01 and 2099-12-31.');
  });

  test('recurrence until rejects over max date', () => {
    expect(() => recurrenceSchema.parse({ freq: 'DAILY', interval: 1, until: '2100-01-01T00:00:00Z' })).toThrow();
  });
});
