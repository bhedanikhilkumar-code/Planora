import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AdminLayout from './admin/components/AdminLayout';
import AdminProtectedRoute from './admin/components/AdminProtectedRoute';
import AdminAuditLogsPage from './admin/pages/AdminAuditLogsPage';
import AdminDashboardPage from './admin/pages/AdminDashboardPage';
import AdminEventsPage from './admin/pages/AdminEventsPage';
import AdminLoginPage from './admin/pages/AdminLoginPage';
import AdminSettingsPage from './admin/pages/AdminSettingsPage';
import AdminUserDetailPage from './admin/pages/AdminUserDetailPage';
import AdminUsersPage from './admin/pages/AdminUsersPage';
import { ForgotPage, LoginPage, RegisterPage, ResetPage } from './pages/AuthPages';
import CalendarPage from './pages/CalendarPage';
import ImportExportPage from './pages/ImportExportPage';
import LandingPage from './pages/LandingPage';
import SearchFilterPanel from './pages/SearchFilterPanel';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const { auth } = useAuth();
  return (
    <div>
      <nav className="p-3 bg-slate-800 text-white flex gap-3"><Link to="/">Home</Link><Link to="/calendar">Calendar</Link><Link to="/settings">Settings</Link><Link to="/import-export">Import/Export</Link><Link to="/admin/dashboard">Admin</Link></nav>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPage />} />
        <Route path="/reset-password" element={<ResetPage />} />
        <Route path="/calendar" element={auth ? <div className="grid grid-cols-4"><div className="col-span-3"><CalendarPage /></div><SearchFilterPanel /></div> : <Navigate to="/login" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/import-export" element={<ImportExportPage />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
            <Route path="/admin/events" element={<AdminEventsPage />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}
