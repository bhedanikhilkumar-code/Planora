-- Generated baseline migration for Planora
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "RecurrenceFreq" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "banned" BOOLEAN NOT NULL DEFAULT false,
  "timezone" TEXT NOT NULL DEFAULT 'UTC',
  "weekStartsOn" INTEGER NOT NULL DEFAULT 1,
  "hourFormat24" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
);
CREATE TABLE "RefreshToken" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "revoked" BOOLEAN NOT NULL DEFAULT false,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "Category" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT NOT NULL
);
CREATE TABLE "Event" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "startAt" TIMESTAMP NOT NULL,
  "endAt" TIMESTAMP NOT NULL,
  "allDay" BOOLEAN NOT NULL DEFAULT false,
  "location" TEXT,
  "color" TEXT,
  "categoryId" TEXT,
  "attendees" TEXT[] NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL
);
CREATE TABLE "EventRecurrence" (
  "id" TEXT PRIMARY KEY,
  "eventId" TEXT UNIQUE NOT NULL,
  "freq" "RecurrenceFreq" NOT NULL,
  "interval" INTEGER NOT NULL DEFAULT 1,
  "byWeekday" INTEGER[] NOT NULL DEFAULT '{}',
  "byMonthday" INTEGER[] NOT NULL DEFAULT '{}',
  "count" INTEGER,
  "until" TIMESTAMP
);
CREATE TABLE "Reminder" (
  "id" TEXT PRIMARY KEY,
  "eventId" TEXT NOT NULL,
  "minutesBefore" INTEGER NOT NULL
);
CREATE TABLE "Attachment" (
  "id" TEXT PRIMARY KEY,
  "eventId" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "mimetype" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "storagePath" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "AuditLog" (
  "id" TEXT PRIMARY KEY,
  "adminId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "ip" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE "SystemSetting" (
  "id" TEXT PRIMARY KEY,
  "registrationEnabled" BOOLEAN NOT NULL DEFAULT true,
  "emailFrom" TEXT,
  "backupConfig" JSONB
);
CREATE UNIQUE INDEX "Category_userId_name_key" ON "Category"("userId", "name");

ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL;
ALTER TABLE "EventRecurrence" ADD CONSTRAINT "EventRecurrence_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE;
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE;
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE;
