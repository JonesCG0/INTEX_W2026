// Central API helper — all backend calls go through here.
// Set VITE_API_URL in .env to change the backend base URL.
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5262';

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) {
        message = payload.error;
      }
    } catch {
      // Keep the status-based fallback.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export type CurrentUser = {
  isAuthenticated: boolean;
  email: string | null;
  displayName: string | null;
  role: string | null;
};

const api = {
  health: () => requestJson<{ status: string; timestamp: string }>('/api/health'),
  message: () => requestJson<{ message: string }>('/api/message'),
  currentUser: () => requestJson<CurrentUser>('/api/auth/me'),
  login: (email: string, password: string) =>
    requestJson<{ isAuthenticated: boolean; email: string; displayName: string; role: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
    ),
  logout: () => requestJson<void>('/api/auth/logout', { method: 'POST' }),
};

export default api;
