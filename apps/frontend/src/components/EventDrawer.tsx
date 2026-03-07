import type { EventApi } from '@fullcalendar/core';

const getExtendedProp = (event: EventApi, key: string) => {
  const value = event.extendedProps?.[key];
  return typeof value === 'string' ? value : '';
};

export const EventDrawer = ({ event }: { event: EventApi | null }) => (
  <aside className="p-4 bg-white rounded shadow">
    <h3 className="font-semibold">Event Details</h3>
    {event ? (
      <div className="space-y-1 text-sm"><p>{event.title}</p><p>{getExtendedProp(event, 'description')}</p><p>{getExtendedProp(event, 'location')}</p></div>
    ) : <p>Select an event</p>}
  </aside>
);
