/**
 * Laravel REST API client for protocols, threads, comments, reviews, votes.
 * Search uses backend Typesense proxy (e.g. GET /api/search/protocols?q=...&sort=...).
 */

import type {
  ApiProtocol,
  ApiThread,
  ApiComment,
  ApiReview,
  Paginated,
  SortProtocols,
  SortThreads,
  VoteDirection,
} from './api-types'

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/$/, '')

/** Use in catch blocks to turn "Failed to fetch" into a helpful message. */
export function getApiConnectionError(url: string): string {
  return `Cannot reach the API at ${url}. Ensure the Laravel API is running (e.g. \`php artisan serve\`) and NEXT_PUBLIC_API_URL is set in .env.local (e.g. http://localhost:8000). Restart the Next.js dev server after changing .env.local.`
}

function getJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    return res.json().then((d) => Promise.reject(new ApiError(res.status, d)))
  }
  return res.json()
}

function unwrap<T>(data: { data?: T } | T): T {
  if (data != null && typeof data === 'object' && 'data' in data) return (data as { data: T }).data
  return data as T
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown
  ) {
    super(`API error ${status}`)
    this.name = 'ApiError'
  }
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_URL}${path.startsWith('/') ? path : `/${path}`}`
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
    const raw = await getJson<{ data?: T } | T>(res)
    return unwrap(raw) as T
  } catch (e) {
    if (e instanceof ApiError) throw e
    const isNetworkError = e instanceof TypeError && (e.message === 'Failed to fetch' || (e as Error).cause?.toString?.().includes('fetch'))
    throw new Error(isNetworkError ? getApiConnectionError(API_URL) : (e instanceof Error ? e.message : 'Network error'))
  }
}

/** Fetch and return full JSON (no unwrap). Use for search so frontend gets { data, meta }. */
async function apiFetchRaw<T>(path: string, options?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_URL}${path.startsWith('/') ? path : `/${path}`}`
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })
    return getJson<T>(res)
  } catch (e) {
    if (e instanceof ApiError) throw e
    const isNetworkError = e instanceof TypeError && (e.message === 'Failed to fetch' || (e as Error).cause?.toString?.().includes('fetch'))
    throw new Error(isNetworkError ? getApiConnectionError(API_URL) : (e instanceof Error ? e.message : 'Network error'))
  }
}

// --- Protocols ---

export async function listProtocols(params: {
  search?: string
  sort?: SortProtocols
  page?: number
}): Promise<Paginated<ApiProtocol>> {
  const sp = new URLSearchParams()
  if (params.search) sp.set('search', params.search)
  if (params.sort) sp.set('sort', params.sort)
  if (params.page != null) sp.set('page', String(params.page))
  const q = sp.toString()
  return apiFetch<Paginated<ApiProtocol>>(`/api/protocols${q ? `?${q}` : ''}`)
}

export async function getProtocol(id: string | number): Promise<ApiProtocol> {
  return apiFetch<ApiProtocol>(`/api/protocols/${id}`)
}

export async function getProtocolThreads(
  protocolId: string | number,
  params?: { sort?: SortThreads; page?: number }
): Promise<Paginated<ApiThread>> {
  const sp = new URLSearchParams()
  if (params?.sort) sp.set('sort', params.sort)
  if (params?.page != null) sp.set('page', String(params.page))
  const q = sp.toString()
  return apiFetch<Paginated<ApiThread>>(
    `/api/protocols/${protocolId}/threads${q ? `?${q}` : ''}`
  )
}

export async function getProtocolReviews(
  protocolId: string | number
): Promise<ApiReview[]> {
  const raw = await apiFetch<ApiReview[] | Paginated<ApiReview>>(
    `/api/protocols/${protocolId}/reviews`
  )
  return Array.isArray(raw) ? raw : raw.data
}

export async function createReview(
  protocolId: string | number,
  payload: { rating: number; feedback?: string }
): Promise<ApiReview> {
  return apiFetch<ApiReview>('/api/reviews', {
    method: 'POST',
    body: JSON.stringify({
      protocol_id: Number(protocolId),
      rating: payload.rating,
      feedback: payload.feedback,
    }),
  })
}

// --- Threads ---

export async function listThreads(params: {
  search?: string
  sort?: SortThreads
  protocol_id?: number
  page?: number
}): Promise<Paginated<ApiThread>> {
  const sp = new URLSearchParams()
  if (params.search) sp.set('search', params.search)
  if (params.sort) sp.set('sort', params.sort)
  if (params.protocol_id != null) sp.set('protocol_id', String(params.protocol_id))
  if (params.page != null) sp.set('page', String(params.page))
  const q = sp.toString()
  return apiFetch<Paginated<ApiThread>>(`/api/threads${q ? `?${q}` : ''}`)
}

export async function getThread(id: string | number): Promise<ApiThread> {
  return apiFetch<ApiThread>(`/api/threads/${id}`)
}

export async function createThread(
  protocolId: string | number,
  payload: { title: string; body: string }
): Promise<ApiThread> {
  return apiFetch<ApiThread>('/api/threads', {
    method: 'POST',
    body: JSON.stringify({
      protocol_id: Number(protocolId),
      title: payload.title,
      body: payload.body,
    }),
  })
}

/** Backend: POST /api/votes with voteable_id, voteable_type, value (+1/-1). If your Laravel uses morph map, try 'App\\Models\\Thread'. */
export async function voteThread(
  threadId: string | number,
  direction: VoteDirection
): Promise<{ votes_count: number }> {
  const value = direction === 'up' ? 1 : -1
  const res = await apiFetch<{ votes_count?: number }>('/api/votes', {
    method: 'POST',
    body: JSON.stringify({
      voteable_id: Number(threadId),
      voteable_type: 'thread',
      value,
    }),
  })
  return { votes_count: res.votes_count ?? 0 }
}

// --- Comments ---

export async function listComments(
  threadId: string | number
): Promise<ApiComment[]> {
  const raw = await apiFetch<ApiComment[] | Paginated<ApiComment>>(
    `/api/threads/${threadId}/comments`
  )
  return Array.isArray(raw) ? raw : raw.data
}

export async function createComment(
  threadId: string | number,
  payload: { body: string; parent_id?: number }
): Promise<ApiComment> {
  return apiFetch<ApiComment>(`/api/threads/${threadId}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** Backend: POST /api/votes. If your Laravel uses morph map, try voteable_type: 'App\\Models\\Comment'. */
export async function voteComment(
  commentId: string | number,
  direction: VoteDirection
): Promise<{ votes_count: number }> {
  const value = direction === 'up' ? 1 : -1
  const res = await apiFetch<{ votes_count?: number }>('/api/votes', {
    method: 'POST',
    body: JSON.stringify({
      voteable_id: Number(commentId),
      voteable_type: 'comment',
      value,
    }),
  })
  return { votes_count: res.votes_count ?? 0 }
}

// --- Search (use list endpoints with search param to match backend GET /api/protocols?search=... and GET /api/threads?search=...) ---

export async function searchProtocols(params: {
  q: string
  sort?: SortProtocols
  page?: number
}): Promise<Paginated<ApiProtocol>> {
  return listProtocols({
    search: params.q,
    sort: params.sort,
    page: params.page,
  })
}

export async function searchThreads(params: {
  q: string
  sort?: SortThreads
  protocol_id?: number
  page?: number
}): Promise<Paginated<ApiThread>> {
  return listThreads({
    search: params.q,
    sort: params.sort,
    protocol_id: params.protocol_id,
    page: params.page,
  })
}
