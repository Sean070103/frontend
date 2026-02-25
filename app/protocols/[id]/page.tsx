'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { ArrowLeft, MessageSquare, FileText, ThumbsUp } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { ThreadList } from '@/components/thread-list'
import { StarRating } from '@/components/star-rating'
import { EmptyState } from '@/components/empty-state'
import {
  getProtocol,
  getProtocolThreads,
  getProtocolReviews,
  createThread,
  createReview,
} from '@/lib/api'
import { apiThreadToThread, apiProtocolToCard } from '@/lib/mappers'
import { getMockProtocol, getMockReviews } from '@/lib/mock-data'
import { looksLikeLatin } from '@/lib/latin'
import type { ApiProtocol, ApiReview } from '@/lib/api-types'
import type { SortThreads } from '@/lib/api-types'

export default function ProtocolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const id = String(params.id)

  const [protocol, setProtocol] = useState<ApiProtocol | null>(null)
  const [threads, setThreads] = useState<ReturnType<typeof apiThreadToThread>[]>([])
  const [reviews, setReviews] = useState<ApiReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortThreads, setSortThreads] = useState<SortThreads>('recent')

  const [showThreadForm, setShowThreadForm] = useState(false)
  const [threadTitle, setThreadTitle] = useState('')
  const [threadBody, setThreadBody] = useState('')
  const [submittingThread, setSubmittingThread] = useState(false)

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewFeedback, setReviewFeedback] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [p, tRes, r] = await Promise.all([
        getProtocol(id),
        getProtocolThreads(id, { sort: sortThreads }),
        getProtocolReviews(id),
      ])
      setProtocol(p)
      setThreads((tRes.data || []).map(apiThreadToThread))
      setReviews(Array.isArray(r) ? r : (r as { data?: ApiReview[] }).data ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load protocol')
      setProtocol(null)
      setThreads([])
      setReviews([])
      const mock = getMockProtocol(id)
      if (mock) {
        setError(null)
        setProtocol({
          id: Number(mock.id),
          title: mock.title,
          content: mock.content,
          tags: mock.tags,
          author: mock.author,
          rating: mock.rating,
          created_at: mock.createdAt,
          updated_at: mock.createdAt,
          votes_count: mock.votesCount,
          reviews_count: mock.reviewsCount,
          threads_count: mock.threadsCount,
        })
      }
    } finally {
      setLoading(false)
    }
  }, [id, sortThreads])

  useEffect(() => {
    load()
  }, [load])

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!threadTitle.trim() || !threadBody.trim()) return
    setSubmittingThread(true)
    try {
      const created = await createThread(Number(id), {
        title: threadTitle.trim(),
        body: threadBody.trim(),
      })
      setThreadTitle('')
      setThreadBody('')
      setShowThreadForm(false)
      router.push(`/thread/${created.id}`)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmittingThread(false)
    }
  }

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingReview(true)
    try {
      await createReview(Number(id), {
        rating: reviewRating,
        feedback: reviewFeedback.trim() || undefined,
      })
      setReviewFeedback('')
      setShowReviewForm(false)
      load()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading && !protocol) {
    return (
      <div className="min-h-screen bg-background w-full max-w-[100vw] overflow-x-hidden">
        <Navbar title="Protocol Discussions" isDark={isDark} onToggleDarkMode={() => setTheme(isDark ? 'light' : 'dark')} />
        <main className="w-full max-w-4xl mx-auto px-4 py-8">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-6" />
          <div className="h-40 bg-muted rounded animate-pulse" />
        </main>
      </div>
    )
  }

  if (error || !protocol) {
    return (
      <div className="min-h-screen bg-background w-full max-w-[100vw] overflow-x-hidden">
        <Navbar title="Protocol Discussions" isDark={isDark} onToggleDarkMode={() => setTheme(isDark ? 'light' : 'dark')} />
        <main className="w-full max-w-4xl mx-auto px-4 py-8">
          <p className="text-muted-foreground">{error || 'Protocol not found.'}</p>
          <Link href="/protocols" className="mt-4 inline-block text-primary hover:underline">Back to protocols</Link>
        </main>
      </div>
    )
  }

  const apiCard = apiProtocolToCard(protocol)
  const useEnglishContent = looksLikeLatin(protocol.title) || looksLikeLatin(protocol.content)
  const card = useEnglishContent ? getMockProtocol(id) ?? apiCard : apiCard
  const displayReviews = useEnglishContent ? getMockReviews(id) : reviews
  const avgRating = displayReviews.length ? displayReviews.reduce((sum, r) => sum + r.rating, 0) / displayReviews.length : card.rating

  return (
    <div className="min-h-screen bg-background w-full max-w-[100vw] overflow-x-hidden">
      <Navbar
        title="Protocol Discussions"
        isDark={isDark}
        onToggleDarkMode={() => setTheme(isDark ? 'light' : 'dark')}
      />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link
          href="/protocols"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to protocols
        </Link>

        <article className="rounded-lg bg-card border border-border p-6 mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">{card.title}</h1>
          {card.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-3">
              {card.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded bg-muted text-xs">{tag}</span>
              ))}
            </div>
          )}
          <p className="text-foreground whitespace-pre-wrap mb-4">{card.content}</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>{card.author}</span>
            <StarRating rating={avgRating} size="sm" />
            <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {threads.length}</span>
            <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {reviews.length}</span>
            <span className="flex items-center gap-1"><ThumbsUp className="w-4 h-4" /> {card.votesCount}</span>
          </div>
        </article>

        {/* Reviews */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Reviews ({displayReviews.length})</h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
            >
              {showReviewForm ? 'Cancel' : 'Add review'}
            </button>
          </div>
          {showReviewForm && (
            <form onSubmit={handleCreateReview} className="p-4 rounded-lg bg-muted/30 border border-border mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
              <StarRating rating={reviewRating} size="md" interactive onChange={setReviewRating} />
              <label className="block text-sm font-medium text-foreground mt-3 mb-2">Feedback (optional)</label>
              <textarea
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground mb-3"
                rows={3}
                placeholder="Your experience with this protocol..."
              />
              <button type="submit" disabled={submittingReview} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
                {submittingReview ? 'Submitting...' : 'Submit review'}
              </button>
            </form>
          )}
          {displayReviews.length === 0 && !showReviewForm && (
            <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review.</p>
          )}
          <div className="space-y-3">
            {displayReviews.map((r) => (
              <div key={r.id} className="p-3 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <StarRating rating={r.rating} size="sm" />
                  <span className="text-xs text-muted-foreground">{r.created_at}</span>
                </div>
                {r.feedback && <p className="text-sm text-foreground">{r.feedback}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Threads */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Discussions</h2>
            <button
              onClick={() => setShowThreadForm(!showThreadForm)}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
            >
              {showThreadForm ? 'Cancel' : 'Start discussion'}
            </button>
          </div>
          {showThreadForm && (
            <form onSubmit={handleCreateThread} className="p-4 rounded-lg bg-muted/30 border border-border mb-4">
              <input
                value={threadTitle}
                onChange={(e) => setThreadTitle(e.target.value)}
                placeholder="Thread title"
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground mb-3"
                required
              />
              <textarea
                value={threadBody}
                onChange={(e) => setThreadBody(e.target.value)}
                placeholder="What would you like to discuss?"
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground mb-3"
                rows={4}
                required
              />
              <button type="submit" disabled={submittingThread} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
                {submittingThread ? 'Creating...' : 'Create thread'}
              </button>
            </form>
          )}
          <div className="flex gap-2 mb-3">
            {(['recent', 'most_reviewed', 'top_rated', 'most_upvoted'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortThreads(s)}
                className={`px-3 py-1.5 rounded-lg text-sm ${sortThreads === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
              >
                {s === 'recent' ? 'Recent' : s === 'most_reviewed' ? 'Most reviewed' : s === 'top_rated' ? 'Top rated' : 'Most upvoted'}
              </button>
            ))}
          </div>
          <ThreadList
            threads={threads}
            onThreadClick={(t) => router.push(`/thread/${t.id}`)}
          />
          {threads.length === 0 && !showThreadForm && (
            <EmptyState
              title="No discussions yet"
              description="Start a discussion about this protocol."
              action={{ label: 'Start discussion', onClick: () => setShowThreadForm(true) }}
            />
          )}
        </section>
      </main>
    </div>
  )
}
