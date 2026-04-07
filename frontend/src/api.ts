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

export type UserSummary = {
  id: number;
  email: string;
  displayName: string;
  role: string;
  lockoutEnabled: boolean;
  lockoutEnd: string | null;
  accessFailedCount: number;
};

export type QueryResult = {
  columns: string[];
  rows: (string | number | boolean | null)[][];
};

export type CurrentUser = {
  isAuthenticated: boolean;
  email: string | null;
  displayName: string | null;
  role: string | null;
};

export type ImpactHero = {
  headline: string;
  summary: string;
  publishedLabel: string;
  updatedLabel: string;
};

export type ImpactMetric = {
  label: string;
  valueDisplay: string;
  detail: string;
};

export type ImpactTrendPoint = {
  monthLabel: string;
  donationAmountPhp: number;
  activeResidents: number;
  avgEducationProgress: number;
  avgHealthScore: number;
};

export type ImpactPlatform = {
  platform: string;
  reach: number;
  donationReferrals: number;
  engagementRate: number;
};

export type ImpactSafehouse = {
  safehouseId: number;
  name: string;
  region: string;
  city: string;
  currentOccupancy: number;
  capacityGirls: number;
  capacityStaff: number;
  avgEducationProgress: number | null;
  avgHealthScore: number | null;
  latestMonthLabel: string | null;
};

export type ImpactSnapshot = {
  snapshotDate: string;
  headline: string;
  summary: string;
  publishedAt: string | null;
};

export type ImpactDashboard = {
  hero: ImpactHero;
  metrics: ImpactMetric[];
  donationTrend: ImpactTrendPoint[];
  platformPerformance: ImpactPlatform[];
  safehouses: ImpactSafehouse[];
  snapshots: ImpactSnapshot[];
  generatedAt: string;
};

const api = {
  health: () => requestJson<{ status: string; timestamp: string }>('/api/health'),
  message: () => requestJson<{ message: string }>('/api/message'),
  publicImpact: () => requestJson<ImpactDashboard>('/api/public/impact'),
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

  // Admin — user management
  adminGetUsers: () =>
    requestJson<UserSummary[]>('/api/admin/users'),
  adminChangeRole: (id: number, role: string) =>
    requestJson<void>(`/api/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
  adminDeleteUser: (id: number) =>
    requestJson<void>(`/api/admin/users/${id}`, { method: 'DELETE' }),
  adminUnlockUser: (id: number) =>
    requestJson<void>(`/api/admin/users/${id}/unlock`, { method: 'POST' }),
  adminGetRoles: () =>
    requestJson<string[]>('/api/admin/roles'),

  // Admin — database query
  adminQuery: (sql: string) =>
    requestJson<QueryResult>('/api/admin/query', {
      method: 'POST',
      body: JSON.stringify({ sql }),
    }),
  register: (email: string, displayName: string, password: string, confirmPassword: string) =>
    requestJson<{ isAuthenticated: boolean; email: string; displayName: string; role: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({ email, displayName, password, confirmPassword }),
      },
    ),
};

export default api;
