'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { ArrowLeft, MessageSquare, Eye, Heart } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { VotingSidebar } from '@/components/voting-sidebar'
import { CommentSection } from '@/components/comment-section'
import { StarRating } from '@/components/star-rating'
import {
  getThread,
  listComments,
  voteThread,
  voteComment,
  createComment,
} from '@/lib/api'
import { apiThreadToThread, apiCommentToComment, buildCommentTree } from '@/lib/mappers'
import type { Thread } from '@/components/thread-card'
import type { Comment } from '@/components/collapsible-comment'
import { getThread as getMockThread, getComments as getMockComments } from '@/lib/mock-data'
import { looksLikeLatin } from '@/lib/latin'

export default function ThreadPage() {
  const params = useParams()
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const threadId = params.id as string

  const [thread, setThread] = useState<Thread | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [voteCount, setVoteCount] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [t, cList] = await Promise.all([
        getThread(threadId).catch(() => null),
        listComments(threadId).catch(() => null),
      ])
      if (t) {
        const uiThread = apiThreadToThread(t)
        const useEnglish = looksLikeLatin(uiThread.title) || looksLikeLatin(uiThread.excerpt)
        const displayThread = useEnglish ? (getMockThread(threadId) ?? uiThread) : uiThread
        setThread(displayThread)
        setVoteCount(displayThread.votes)
      } else {
        const mock = getMockThread(threadId)
        if (mock) {
          setThread(mock)
          setVoteCount(mock.votes)
        } else {
          setError('Thread not found')
          setLoading(false)
          return
        }
      }
      let fromApi: Comment[] = []
      try {
        const raw = cList != null && Array.isArray(cList) ? cList : (cList as { data?: unknown[] } | null)?.data ?? []
        const flat = Array.isArray(raw) ? raw : []
        const tree = flat.length > 0 ? buildCommentTree(flat as import('@/lib/api-types').ApiComment[]) : []
        fromApi = tree.map(apiCommentToComment)
      } catch {
        // ignore
      }
      // Use API comments when we have any, so posted comments persist after refresh
      setComments(fromApi.length > 0 ? fromApi : getMockComments(threadId))
    } catch (e) {
      const mock = getMockThread(threadId)
      if (mock) {
        setThread(mock)
        setVoteCount(mock.votes)
        setComments(getMockComments(threadId))
      } else setError('Thread not found')
    } finally {
      setLoading(false)
    }
  }, [threadId])

  useEffect(() => {
    load()
  }, [load])

  const handleVoteThread = async (direction: 'up' | 'down') => {
    if (!thread) return
    try {
      const res = await voteThread(threadId, direction)
      setVoteCount(res.votes_count ?? voteCount + (direction === 'up' ? 1 : -1))
    } catch {
      // optimistic: still update locally if API fails (e.g. already voted)
      setVoteCount((prev) => prev + (direction === 'up' ? 1 : -1))
    }
  }

  const handleVoteComment = async (commentId: string, direction: 'up' | 'down') => {
    try {
      await voteComment(commentId, direction)
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, votes: c.votes + (direction === 'up' ? 1 : -1) }
            : {
                ...c,
                replies: c.replies?.map((r) =>
                  r.id === commentId
                    ? { ...r, votes: r.votes + (direction === 'up' ? 1 : -1) }
                    : r
                ),
              }
        )
      )
    } catch {
      // ignore
    }
  }

  const handleCommentSubmit = async (content: string) => {
    try {
      const created = await createComment(threadId, { body: content })
      const newComment: Comment = {
        id: String(created.id),
        author: (created.user as { name?: string })?.name ?? 'You',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=you`,
        content: created.body,
        timestamp: new Date(created.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        votes: created.votes_count ?? 0,
      }
      setComments((prev) => [...prev, newComment])
    } catch {
      setComments((prev) => [
        ...prev,
        {
          id: `new-${Date.now()}`,
          author: 'You',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
          content,
          timestamp: new Date().toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          votes: 0,
        },
      ])
    }
  }

  const handleReply = async (parentId: string, content: string) => {
    try {
      const created = await createComment(threadId, {
        body: content,
        parent_id: Number(parentId),
      })
      const newReply: Comment = {
        id: String(created.id),
        author: (created.user as { name?: string })?.name ?? 'You',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=you`,
        content: created.body,
        timestamp: new Date(created.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        votes: created.votes_count ?? 0,
      }
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies ?? []), newReply] }
            : c
        )
      )
    } catch {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? {
                ...c,
                replies: [
                  ...(c.replies ?? []),
                  {
                    id: `reply-${Date.now()}`,
                    author: 'You',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
                    content,
                    timestamp: new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    }),
                    votes: 0,
                  },
                ],
              }
            : c
        )
      )
    }
  }

  if (loading && !thread) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar title="Protocol Discussions" isDark={isDark} onToggleDarkMode={() => setTheme(isDark ? 'light' : 'dark')} />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-6" />
          <div className="h-40 bg-muted rounded animate-pulse" />
        </main>
      </div>
    )
  }

  if (error || !thread) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar title="Protocol Discussions" isDark={isDark} onToggleDarkMode={() => setTheme(isDark ? 'light' : 'dark')} />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-muted-foreground">{error || 'Thread not found.'}</p>
          <button onClick={() => router.push('/')} className="mt-4 text-primary hover:underline">
            Back to discussions
          </button>
        </main>
      </div>
    )
  }

  const totalComments =
    comments.length + comments.reduce((acc, c) => acc + (c.replies?.length ?? 0), 0)

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        title="Protocol Discussions"
        isDark={isDark}
        onToggleDarkMode={() => setTheme(isDark ? 'light' : 'dark')}
      />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex gap-6">
          <VotingSidebar
            votes={voteCount}
            onVote={handleVoteThread}
            onSave={() => {}}
            onShare={() => {}}
          />

          <div className="flex-1 min-w-0">
            <article className="rounded-lg bg-card border border-border p-6 mb-8">
              <div className="flex gap-3 mb-4">
                <img
                  src={thread.avatar}
                  alt={thread.author}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{thread.author}</p>
                  <p className="text-xs text-muted-foreground">{thread.timestamp}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                    {thread.category}
                  </span>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-foreground mb-3">{thread.title}</h1>
              <p className="text-foreground leading-relaxed mb-4">{thread.excerpt}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <StarRating rating={thread.rating} size="sm" />
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {thread.replies}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {thread.views}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {voteCount}
                </span>
              </div>
            </article>

            <CommentSection
              comments={comments}
              totalCount={totalComments}
              onCommentSubmit={handleCommentSubmit}
              onReply={handleReply}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
