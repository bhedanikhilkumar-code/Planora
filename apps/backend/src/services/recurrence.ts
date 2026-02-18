import { Event, EventRecurrence, RecurrenceFreq } from '@prisma/client';
import { RRule } from 'rrule';

const mapFreq = (freq: RecurrenceFreq) => ({ DAILY: RRule.DAILY, WEEKLY: RRule.WEEKLY, MONTHLY: RRule.MONTHLY, YEARLY: RRule.YEARLY }[freq]);

export const expandOccurrences = (
  event: Event & { recurrence: EventRecurrence | null },
  from: Date,
  to: Date
): Date[] => {
  if (!event.recurrence) return event.startAt >= from && event.startAt <= to ? [event.startAt] : [];
  const r = event.recurrence;
  const rule = new RRule({
    freq: mapFreq(r.freq),
    dtstart: event.startAt,
    interval: r.interval,
    count: r.count ?? undefined,
    until: r.until ?? to,
    byweekday: r.byWeekday.length ? r.byWeekday : undefined,
    bymonthday: r.byMonthday.length ? r.byMonthday : undefined
  });
  return rule.between(from, to, true);
};
