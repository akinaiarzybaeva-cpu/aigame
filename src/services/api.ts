const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export type ApiUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  xp: number;
  completedGames: string[];
  role: 'user' | 'admin';
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('cb-token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Сурам аткарылган жок.');
  return data as T;
}

export async function authenticate(mode: 'login' | 'register', payload: Record<string, string>) {
  const data = await request<{ token: string; user: ApiUser }>(`/auth/${mode}`, {
    method: 'POST', body: JSON.stringify(payload),
  });
  localStorage.setItem('cb-token', data.token);
  return data.user;
}

export async function fetchCurrentUser() {
  return request<{ user: ApiUser }>('/auth/me');
}
