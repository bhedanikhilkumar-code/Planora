import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', role: 'ADMIN', passwordHash: await bcrypt.hash('Admin@12345', 10) }
  });
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: { email: 'user@example.com', role: 'USER', passwordHash: await bcrypt.hash('User@12345', 10) }
  });

  const daily = await prisma.event.create({
    data: {
      userId: user.id,
      title: 'Daily Standup',
      startAt: new Date('2026-01-10T09:00:00Z'),
      endAt: new Date('2026-01-10T09:30:00Z'),
      recurrence: { create: { freq: 'DAILY', interval: 1, count: 5 } },
      reminders: { create: [{ minutesBefore: 10 }] }
    }
  });
  await prisma.event.create({
    data: {
      userId: user.id,
      title: 'Monthly Review',
      startAt: new Date('2026-01-15T14:00:00Z'),
      endAt: new Date('2026-01-15T15:00:00Z'),
      recurrence: { create: { freq: 'MONTHLY', interval: 1, until: new Date('2026-12-31T00:00:00Z') } }
    }
  });

  console.log({ admin: admin.email, user: user.email, demoEvent: daily.id });
}

main().finally(() => prisma.$disconnect());
