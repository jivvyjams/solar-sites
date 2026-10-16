import { createContext, useContext } from "react";
import type { Credentials } from "../api/types";

export type AuthStatus = "loading" | "anon" | "authed";

export type AuthValue = {
  status: AuthStatus;
  email: string | null;
  login: (credentials: Credentials) => Promise<void>;
  register: (credentials: Credentials) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthValue | null>(null);

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (value === null) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return value;
}
