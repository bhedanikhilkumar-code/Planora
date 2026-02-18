import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin@12345');
  const [error, setError] = useState('');
  const nav = useNavigate();
  const { setAdminAuth } = useAuth();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/admin/login', { email, password });
      setAdminAuth(data.accessToken);
      nav('/admin/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Login failed');
    }
  };

  return (
    <form onSubmit={submit} className="max-w-md mx-auto mt-20 bg-white p-6 rounded space-y-3">
      <h2 className="text-xl font-semibold">Admin Login</h2>
      <input className="w-full" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input className="w-full" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button className="w-full">Login</button>
    </form>
  );
}
