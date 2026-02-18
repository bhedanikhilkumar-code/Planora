import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../api/client';

type User = { id: string; email: string; role: 'USER' | 'ADMIN'; banned: boolean; _count: { events: number } };

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [tempPassword, setTempPassword] = useState('');

  const load = () => api.get(`/admin/users/${id}`).then((r) => setUser(r.data));
  useEffect(() => { load(); }, [id]);
  if (!user) return <p>Loading...</p>;

  return (
    <div className="bg-white p-4 rounded space-y-3 max-w-xl">
      <h2 className="font-semibold text-lg">{user.email}</h2>
      <p>Role: {user.role}</p>
      <p>Banned: {String(user.banned)}</p>
      <p>Total events: {user._count.events}</p>
      <div className="flex gap-2 flex-wrap">
        <button onClick={async () => { await api.patch(`/admin/users/${user.id}/ban`, { banned: !user.banned }); load(); }}>{user.banned ? 'Unban' : 'Ban'}</button>
        <button onClick={async () => { await api.patch(`/admin/users/${user.id}/role`, { role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' }); load(); }}>Set {user.role === 'ADMIN' ? 'USER' : 'ADMIN'}</button>
        <button onClick={async () => { const { data } = await api.post(`/admin/users/${user.id}/reset-password`); setTempPassword(data.tempPassword); }}>Reset Password</button>
      </div>
      {tempPassword && <p className="text-sm text-amber-700">Temporary password: {tempPassword}</p>}
    </div>
  );
}
