import { createContext, useContext, useMemo, useState } from 'react';

type Role = 'USER' | 'ADMIN';
type AuthState = { accessToken: string; role: Role } | null;

const AuthContext = createContext<{
  auth: AuthState;
  setUserAuth: (token: string) => void;
  setAdminAuth: (token: string) => void;
  logout: () => void;
}>({ auth: null, setUserAuth: () => {}, setAdminAuth: () => {}, logout: () => {} });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const accessToken = localStorage.getItem('planora_token');
    const role = localStorage.getItem('planora_role') as Role | null;
    return accessToken && role ? { accessToken, role } : null;
  });

  const value = useMemo(
    () => ({
      auth,
      setUserAuth: (token: string) => {
        localStorage.setItem('planora_token', token);
        localStorage.setItem('planora_role', 'USER');
        setAuth({ accessToken: token, role: 'USER' });
      },
      setAdminAuth: (token: string) => {
        localStorage.setItem('planora_token', token);
        localStorage.setItem('planora_role', 'ADMIN');
        setAuth({ accessToken: token, role: 'ADMIN' });
      },
      logout: () => {
        localStorage.removeItem('planora_token');
        localStorage.removeItem('planora_role');
        setAuth(null);
      }
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
