import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { useState } from 'react';
import { EventDrawer } from '../components/EventDrawer';
import { EventModal } from '../components/EventModal';

export default function CalendarPage() {
  const [selected, setSelected] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  return (
    <div className="p-4 grid grid-cols-4 gap-4">
      <div className="col-span-3 bg-white p-3 rounded">
        <div className="mb-3"><EventModal onSave={(e) => setEvents((v) => [...v, { title: e.title, start: e.startAt, end: e.endAt }])} /></div>
        <FullCalendar plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]} initialView="dayGridMonth" headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' }} events={events} eventClick={(i)=>setSelected(i.event)} />
      </div>
      <EventDrawer event={selected} />
    </div>
  );
}
