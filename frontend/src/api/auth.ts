import { request, setCsrfToken } from "./client";
import type { Credentials, Me } from "./types";

export async function register(credentials: Credentials): Promise<Me> {
  const me = await request<Me>("/api/register", {
    method: "POST",
    body: credentials,
  });
  setCsrfToken(me.csrfToken);
  return me;
}

export async function login(credentials: Credentials): Promise<Me> {
  const me = await request<Me>("/api/login", {
    method: "POST",
    body: credentials,
  });
  setCsrfToken(me.csrfToken);
  return me;
}

export async function getMe(): Promise<Me> {
  const me = await request<Me>("/api/me");
  setCsrfToken(me.csrfToken);
  return me;
}

export async function logout(): Promise<void> {
  await request<void>("/api/logout", { method: "POST" });
  setCsrfToken(null);
}
