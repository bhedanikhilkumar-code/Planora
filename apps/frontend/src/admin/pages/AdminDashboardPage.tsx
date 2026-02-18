import { useEffect, useState } from 'react';
import { api } from '../../api/client';

type KPIs = { totalUsers: number; activeUsers: number; dailyEvents: number; weeklyEvents: number };

export default function AdminDashboardPage() {
  const [kpi, setKpi] = useState<KPIs | null>(null);
  useEffect(() => { api.get('/admin/kpis').then((r) => setKpi(r.data)); }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        ['Total Users', kpi?.totalUsers],
        ['Active Users (7d)', kpi?.activeUsers],
        ['Events (24h)', kpi?.dailyEvents],
        ['Events (7d)', kpi?.weeklyEvents]
      ].map(([label, value]) => (
        <div key={label} className="bg-white rounded p-4 shadow-sm">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold">{value ?? '-'}</p>
        </div>
      ))}
    </div>
  );
}
