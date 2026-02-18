import { FormEvent, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { setUserAuth } = useAuth();
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('User@12345');
  const [error, setError] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUserAuth(data.accessToken);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Login failed');
    }
  };
  return <form onSubmit={submit} className="p-6 space-y-2"><h2>Login</h2><input value={email} onChange={(e)=>setEmail(e.target.value)}/><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)}/>{error && <p className="text-red-600 text-sm">{error}</p>}<button>Login</button></form>;
}
export function RegisterPage() { return <div className="p-6">Register form available via /auth/register endpoint.</div>; }
export function ForgotPage() { return <div className="p-6">Forgot Password screen.</div>; }
export function ResetPage() { return <div className="p-6">Reset Password screen.</div>; }
