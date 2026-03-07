import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventApi, EventClickArg, EventInput } from '@fullcalendar/core';
import { useMemo, useState } from 'react';
import { EventDrawer } from '../components/EventDrawer';
import { EventModal } from '../components/EventModal';
import type { CalendarFilters } from '../types/events';

export default function CalendarPage({ filters }: { filters: CalendarFilters }) {
  const [selected, setSelected] = useState<EventApi | null>(null);
  const [events, setEvents] = useState<EventInput[]>([]);

  const filteredEvents = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    const from = filters.from ? new Date(`${filters.from}T00:00:00`) : null;
    const to = filters.to ? new Date(`${filters.to}T23:59:59`) : null;

    return events.filter((event) => {
      const title = typeof event.title === 'string' ? event.title.toLowerCase() : '';
      if (query && !title.includes(query)) return false;

      if (!from && !to) return true;

      const start = event.start ? new Date(String(event.start)) : null;
      if (!start) return true;

      if (from && start < from) return false;
      if (to && start > to) return false;
      return true;
    });
  }, [events, filters.from, filters.query, filters.to]);

  return (
    <div className="p-4 grid grid-cols-4 gap-4">
      <div className="col-span-3 bg-white p-3 rounded">
        <div className="mb-3"><EventModal onSave={(e) => setEvents((v) => [...v, { title: e.title, start: e.startAt, end: e.endAt }])} /></div>
        <FullCalendar plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]} initialView="dayGridMonth" headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' }} events={filteredEvents} eventClick={(i: EventClickArg) => setSelected(i.event)} />
      </div>
      <EventDrawer event={selected} />
    </div>
  );
}
