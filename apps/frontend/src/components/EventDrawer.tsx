export const EventDrawer = ({ event }: { event: any }) => (
  <aside className="p-4 bg-white rounded shadow">
    <h3 className="font-semibold">Event Details</h3>
    {event ? (
      <div className="space-y-1 text-sm"><p>{event.title}</p><p>{event.description}</p><p>{event.location}</p></div>
    ) : <p>Select an event</p>}
  </aside>
);
