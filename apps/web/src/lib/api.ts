const IS_SERVER = typeof window === 'undefined';
export const API = (IS_SERVER ? process.env.INTERNAL_API_URL : process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:4000';
export async function api(path: string, method = 'GET', body?: any, token?: string) {
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error('API_ERROR'), { status: r.status, data: j });
  return j;
}
