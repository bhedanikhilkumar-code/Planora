import { useEffect, useState } from 'react';
import { api } from '../../api/client';

type Audit = { id: string; action: string; targetType: string; targetId: string; ip: string; createdAt: string; admin: { email: string } };

export default function AdminAuditLogsPage() {
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [items, setItems] = useState<Audit[]>([]);

  const load = () => api.get('/admin/audit-logs', { params: { page: 1, limit: 50, action: action || undefined, from: from || undefined, to: to || undefined } }).then((r) => setItems(r.data.items));
  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-3">
      <div className="flex gap-2 flex-wrap">
        <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="Action" />
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button onClick={load}>Apply</button>
      </div>
      <div className="bg-white rounded overflow-auto">
        <table className="w-full text-sm">
          <thead><tr><th className="p-2 text-left">Admin</th><th className="text-left">Action</th><th className="text-left">Target</th><th className="text-left">IP</th><th className="text-left">Time</th></tr></thead>
          <tbody>{items.map((l) => <tr className="border-t" key={l.id}><td className="p-2">{l.admin?.email}</td><td>{l.action}</td><td>{l.targetType}:{l.targetId}</td><td>{l.ip}</td><td>{new Date(l.createdAt).toLocaleString()}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
