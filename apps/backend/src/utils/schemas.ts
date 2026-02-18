import { z } from 'zod';
import { dateInAllowedRange } from './dateRange.js';

export const registerSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
export const loginSchema = registerSchema;
export const resetSchema = z.object({ token: z.string().min(8), password: z.string().min(8) });

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startAt: dateInAllowedRange,
  endAt: dateInAllowedRange,
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  color: z.string().optional(),
  categoryId: z.string().optional(),
  attendees: z.array(z.string().email()).default([]),
  reminders: z.array(z.number().int().min(0).max(10080)).default([])
}).refine((d) => d.endAt > d.startAt, 'End date must be after start date');

export const recurrenceSchema = z.object({
  freq: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
  interval: z.number().int().min(1).default(1),
  byWeekday: z.array(z.number().int().min(0).max(6)).optional(),
  byMonthday: z.array(z.number().int().min(1).max(31)).optional(),
  count: z.number().int().positive().optional(),
  until: dateInAllowedRange.optional()
});

export const queryRangeSchema = z.object({ from: dateInAllowedRange, to: dateInAllowedRange });

export const adminLoginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
export const adminUserQuerySchema = paginationSchema.extend({ search: z.string().optional() });
export const adminUserActionSchema = z.object({ banned: z.boolean() });
export const adminRoleSchema = z.object({ role: z.enum(['ADMIN', 'USER']) });
export const adminEventsQuerySchema = paginationSchema.extend({
  q: z.string().optional(),
  from: dateInAllowedRange.optional(),
  to: dateInAllowedRange.optional()
});
export const adminAuditQuerySchema = paginationSchema.extend({
  action: z.string().optional(),
  admin: z.string().optional(),
  from: dateInAllowedRange.optional(),
  to: dateInAllowedRange.optional()
});
export const adminSettingsSchema = z.object({ registrationEnabled: z.boolean() });
