import { FormEvent, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { setAuth } = useAuth();
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('User@12345');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const { data } = await api.post('/auth/login', { email, password });
    setAuth({ accessToken: data.accessToken, role: 'USER' });
  };
  return <form onSubmit={submit} className="p-6 space-y-2"><h2>Login</h2><input value={email} onChange={(e)=>setEmail(e.target.value)}/><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)}/><button>Login</button></form>;
}
export function RegisterPage() { return <div className="p-6">Register form available via /auth/register endpoint.</div>; }
export function ForgotPage() { return <div className="p-6">Forgot Password screen.</div>; }
export function ResetPage() { return <div className="p-6">Reset Password screen.</div>; }
export function AdminLoginPage() { return <div className="p-6">Admin Login screen.</div>; }
