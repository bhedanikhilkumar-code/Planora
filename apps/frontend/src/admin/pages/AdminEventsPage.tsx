import { useEffect, useState } from 'react';
import { api } from '../../api/client';

type EventRow = { id: string; title: string; startAt: string; endAt: string; user: { email: string } };

export default function AdminEventsPage() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<EventRow[]>([]);

  const load = () => api.get('/admin/events', { params: { q, page: 1, limit: 20 } }).then((r) => setItems(r.data.items));
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events" />
        <button onClick={load}>Search</button>
      </div>
      <div className="space-y-2">
        {items.map((e) => (
          <div key={e.id} className="bg-white rounded p-3 flex justify-between items-center">
            <div>
              <p className="font-medium">{e.title}</p>
              <p className="text-sm text-slate-500">{e.user.email} • {new Date(e.startAt).toLocaleString()} - {new Date(e.endAt).toLocaleString()}</p>
            </div>
            <button onClick={async () => { await api.delete(`/admin/events/${e.id}`); load(); }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
