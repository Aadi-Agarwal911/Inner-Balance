import { RoleMode } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: RoleMode;
  alias: string;
  aliasMode: boolean;
  department: string;
  yearLabel: string;
  studentId: string;
  specialization: string;
  isDemo: boolean;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface SignUpPayload {
  fullName: string;
  email: string;
  password: string;
  role: RoleMode;
  department?: string;
  yearLabel?: string;
  studentId?: string;
  alias?: string;
  aliasMode?: boolean;
  specialization?: string;
}

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
  if (!res.ok) {
    throw new Error(data.error || 'Unable to complete authentication request.');
  }
  return data;
}

export async function signUpAccount(payload: SignUpPayload): Promise<AuthSession> {
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseJsonResponse<AuthSession>(res);
}

export async function signInAccount(
  email: string,
  password: string
): Promise<AuthSession> {
  const res = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return parseJsonResponse<AuthSession>(res);
}

export async function signInDemoRole(role: RoleMode): Promise<AuthSession> {
  const res = await fetch('/api/auth/demo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  return parseJsonResponse<AuthSession>(res);
}

export async function signOutAccount(token: string): Promise<void> {
  await fetch('/api/auth/signout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).catch(() => {});
}
