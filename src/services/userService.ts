import { API_BASE_URL } from '../config/target';
import { User } from '../types';

const BASE = API_BASE_URL;

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export async function loginUser(login: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ login, password }),
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = `Ошибка ${res.status}`;
    try {
      const body = JSON.parse(text);
      if (body.error) msg = body.error;
    } catch {
      if (text) msg = text;
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function registerUser(login: string, password: string, first_name?: string, last_name?: string, email?: string): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ login, password, first_name, last_name, email }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Ошибка ${res.status}`);
  }
  return res.json();
}

export async function logoutUser(): Promise<void> {
  await fetch(`${BASE}/auth/logout`, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'include',
  });
}

export async function fetchCurrentUser(): Promise<User> {
  const res = await fetch(`${BASE}/auth/me`, {
    headers: authHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Ошибка ${res.status}`);
  return res.json();
}

export async function updateUserProfile(data: Partial<User> & { password?: string }): Promise<User> {
  const res = await fetch(`${BASE}/auth/me`, {
    method: 'PUT',
    headers: authHeaders(),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Ошибка ${res.status}`);
  }
  return res.json();
}
