import { API_BASE_URL } from '../config/target';
import { Instrument, InstrumentFilter } from '../types';

const BASE = API_BASE_URL;

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  const h: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export async function fetchInstruments(filters: InstrumentFilter = {}): Promise<Instrument[]> {
  const params = new URLSearchParams();
  if (filters.type) params.append('type', filters.type);
  if (filters.status) params.append('status', filters.status);
  if (filters.search) params.append('search', filters.search);
  if (filters.min_accuracy) params.append('min_accuracy', filters.min_accuracy.toString());
  if (filters.max_accuracy) params.append('max_accuracy', filters.max_accuracy.toString());
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);
  const qs = params.toString();
  const res = await fetch(`${BASE}/services${qs ? `?${qs}` : ''}`, {
    headers: authHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Ошибка ${res.status}`);
  return res.json();
}

export async function fetchInstrumentById(id: number): Promise<Instrument> {
  const res = await fetch(`${BASE}/services/${id}`, {
    headers: authHeaders(),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`Ошибка ${res.status}`);
  return res.json();
}
