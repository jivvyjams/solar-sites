import { useEffect, useState, type ReactNode } from "react";
import * as api from "../api/auth";
import type { Credentials } from "../api/types";
import { AuthContext, type AuthStatus } from "./useAuth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    api
      .getMe()
      .then((me) => {
        setEmail(me.email);
        setStatus("authed");
      })
      .catch(() => {
        setStatus("anon");
      });
  }, []);

  async function login(credentials: Credentials): Promise<void> {
    const me = await api.login(credentials);
    setEmail(me.email);
    setStatus("authed");
  }

  async function register(credentials: Credentials): Promise<void> {
    const me = await api.register(credentials);
    setEmail(me.email);
    setStatus("authed");
  }

  async function logout(): Promise<void> {
    try {
      await api.logout();
    } catch {
      // session already gone (401) or server unreachable: log out locally anyway
    }
    setEmail(null);
    setStatus("anon");
  }

  return (
    <AuthContext value={{ status, email, login, register, logout }}>
      {children}
    </AuthContext>
  );
}
