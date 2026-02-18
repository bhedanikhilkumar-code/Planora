import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

type User = { id: string; email: string; role: 'USER' | 'ADMIN'; banned: boolean; createdAt: string };

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: User[]; totalPages: number }>({ items: [], totalPages: 1 });

  const load = () => api.get('/admin/users', { params: { search, page, limit: 10 } }).then((r) => setData(r.data));
  useEffect(() => { load(); }, [page]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users" />
        <button onClick={() => { setPage(1); load(); }}>Search</button>
      </div>
      <div className="bg-white rounded overflow-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left"><th className="p-2">Email</th><th>Role</th><th>Banned</th><th>Created</th><th></th></tr></thead>
          <tbody>
            {data.items.map((u) => (
              <tr key={u.id} className="border-t"><td className="p-2">{u.email}</td><td>{u.role}</td><td>{String(u.banned)}</td><td>{new Date(u.createdAt).toLocaleDateString()}</td><td><Link to={`/admin/users/${u.id}`}>Open</Link></td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
        <span>Page {page}</span>
        <button onClick={() => setPage((p) => Math.min(data.totalPages || 1, p + 1))}>Next</button>
      </div>
    </div>
  );
}
