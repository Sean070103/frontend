import type { Thread } from '@/components/thread-card'
import type { Comment } from '@/components/collapsible-comment'
import type { ApiThread, ApiComment, ApiProtocol } from './api-types'

/** Build nested tree from flat comments with parent_id */
export function buildCommentTree(flat: ApiComment[]): ApiComment[] {
  const byId = new Map<number, ApiComment & { children?: ApiComment[] }>()
  flat.forEach((c) => byId.set(c.id, { ...c, children: [] }))
  const roots: ApiComment[] = []
  byId.forEach((c) => {
    if (c.parent_id == null) roots.push(c)
    else {
      const parent = byId.get(c.parent_id)
      if (parent) (parent.children = parent.children || []).push(c)
      else roots.push(c)
    }
  })
  return roots
}

const avatar = (name: string | undefined, id: number) =>
  name
    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export function apiThreadToThread(t: ApiThread): Thread {
  const author = t.user?.name ?? (t as { author?: string }).author ?? 'Anonymous'
  return {
    id: String(t.id),
    title: t.title,
    author,
    avatar: (t.user as { avatar_url?: string })?.avatar_url ?? avatar(author, t.id),
    category: t.protocol?.title ?? 'Discussion',
    excerpt: typeof t.body === 'string' ? t.body.slice(0, 160) : '',
    votes: t.votes_count ?? 0,
    replies: t.comments_count ?? 0,
    views: t.views_count ?? 0,
    rating: t.rating ?? 0,
    timestamp: t.created_at,
  }
}

export function apiCommentToComment(c: ApiComment): Comment {
  const author = c.user?.name ?? (c as { author?: string }).author ?? 'Anonymous'
  return {
    id: String(c.id),
    author,
    avatar: (c.user as { avatar_url?: string })?.avatar_url ?? (c as { avatar_url?: string }).avatar_url ?? avatar(author, c.id),
    content: c.body,
    timestamp: formatDate(c.created_at),
    votes: c.votes_count ?? 0,
    replies: c.children?.length ? c.children.map(apiCommentToComment) : undefined,
  }
}

export function apiProtocolToCard(p: ApiProtocol) {
  return {
    id: String(p.id),
    title: p.title,
    content: p.content,
    tags: p.tags ?? [],
    author: p.author ?? 'Community',
    rating: p.rating ?? 0,
    createdAt: p.created_at,
    votesCount: p.votes_count ?? 0,
    reviewsCount: p.reviews_count ?? 0,
    threadsCount: p.threads_count ?? 0,
  }
}
