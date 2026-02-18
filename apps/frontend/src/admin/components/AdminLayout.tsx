import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [
  ['/admin/dashboard', 'Dashboard'],
  ['/admin/users', 'Users'],
  ['/admin/events', 'Events'],
  ['/admin/audit-logs', 'Audit Logs'],
  ['/admin/settings', 'Settings']
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b px-4 py-3 flex justify-between">
        <h1 className="font-bold">Planora Admin</h1>
        <button onClick={logout}>Logout</button>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
        <aside className="bg-slate-900 text-white p-4 space-y-2 min-h-[calc(100vh-52px)]">
          {links.map(([href, label]) => (
            <Link key={href} to={href} className={`block px-2 py-1 rounded ${pathname === href ? 'bg-slate-700' : 'bg-transparent'}`}>
              {label}
            </Link>
          ))}
        </aside>
        <main className="p-4"><Outlet /></main>
      </div>
    </div>
  );
}
