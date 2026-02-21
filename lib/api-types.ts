/**
 * API types aligned with Laravel backend (snake_case in JSON).
 * Mappers in api.ts convert these to UI shapes where needed.
 */

export type SortProtocols = 'recent' | 'most_reviewed' | 'top_rated' | 'most_upvoted'
export type SortThreads = 'recent' | 'most_reviewed' | 'top_rated' | 'most_upvoted'
export type VoteDirection = 'up' | 'down'

export interface ApiProtocol {
  id: number
  title: string
  content: string
  tags?: string[]
  author?: string
  rating?: number
  created_at: string
  updated_at: string
  votes_count?: number
  reviews_count?: number
  threads_count?: number
}

export interface ApiThread {
  id: number
  title: string
  body: string
  protocol_id: number
  created_at: string
  updated_at: string
  votes_count?: number
  comments_count?: number
  views_count?: number
  rating?: number
  author?: string
  user?: { name: string; avatar_url?: string }
  protocol?: ApiProtocol
}

export interface ApiComment {
  id: number
  body: string
  thread_id: number
  parent_id: number | null
  created_at: string
  updated_at: string
  votes_count?: number
  user?: { name: string; avatar_url?: string }
  author?: string
  avatar_url?: string
  children?: ApiComment[]
}

export interface ApiReview {
  id: number
  protocol_id: number
  rating: number
  feedback?: string | null
  created_at: string
  user?: { name: string }
}

export interface ApiVote {
  id: number
  votable_type: string
  votable_id: number
  direction: 1 | -1
}

export interface Paginated<T> {
  data: T[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface SearchResult<T> {
  hits: T[]
  found?: number
}
