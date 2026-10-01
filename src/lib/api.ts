import { notFound, redirect } from 'next/navigation';
import { getToken } from './session';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public field?: string,
  ) {
    super(message);
  }
}

function baseUrl() {
  const url = process.env.API_URL;
  if (!url) throw new Error('API_URL is not set. Point it at the Summertech LMS API (see .env.example).');
  return url.replace(/\/+$/, '');
}

type Options = { method?: string; body?: unknown; token?: string | null };

/** Calls the API with the signed-in user's token. Throws ApiError on 4xx/5xx. */
export async function api<T = unknown>(path: string, { method = 'GET', body, token }: Options = {}): Promise<T> {
  const auth = token === undefined ? await getToken() : token;
  const headers: Record<string, string> = {};
  if (auth) headers.Authorization = `Bearer ${auth}`;

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const res = await fetch(baseUrl() + path, { method, headers, body: payload, cache: 'no-store' });
  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data.error ?? `Request failed (${res.status})`, data.field);
  }
  return data as T;
}

/**
 * For page loads: a missing/expired session goes to /login, a forbidden page
 * back to the dashboard, and a missing record to the 404 page.
 */
export async function load<T>(path: string): Promise<T> {
  try {
    return await api<T>(path);
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 401) redirect('/login');
      if (err.status === 403) redirect('/dashboard');
      if (err.status === 404) notFound();
    }
    throw err;
  }
}
