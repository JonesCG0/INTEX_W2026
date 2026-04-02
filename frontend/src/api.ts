// Central API helper — all backend calls go through here.
// Set VITE_API_URL in .env to change the backend base URL.
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5262'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}

const api = {
  health: () => get<{ status: string; timestamp: string }>('/api/health'),
  message: () => get<{ message: string }>('/api/message'),
}

export default api
