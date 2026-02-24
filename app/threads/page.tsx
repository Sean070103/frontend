'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Navbar } from '@/components/navbar'
import { ThreadList } from '@/components/thread-list'
import { listThreads, searchThreads, voteThread } from '@/lib/api'
import { apiThreadToThread } from '@/lib/mappers'
import { MOCK_THREADS, getThread as getMockThread } from '@/lib/mock-data'
import { looksLikeLatin } from '@/lib/latin'
import type { SortThreads } from '@/lib/api-types'

const SORT_OPTIONS: { value: SortThreads; label: string }[] = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'most_reviewed', label: 'Most Reviews' },
  { value: 'top_rated', label: 'Top Rated' },
  { value: 'most_upvoted', label: 'Most Upvoted' },
]

export default function ThreadsPage() {
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortThreads>('recent')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [threads, setThreads] = useState<ReturnType<typeof apiThreadToThread>[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = search.trim()
        ? await searchThreads({ q: search.trim(), sort })
        : await listThreads({ sort })
      const data = (res as { data?: unknown[] }).data ?? []
      const rawList = Array.isArray(data) ? data.map((t) => apiThreadToThread(t as import('@/lib/api-types').ApiThread)) : []
      const list = rawList.length > 0
        ? rawList.map((t) =>
            looksLikeLatin(t.title) || looksLikeLatin(t.excerpt)
              ? (getMockThread(t.id) ?? t)
              : t
          )
        : MOCK_THREADS
      setThreads(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load threads')
      setThreads(MOCK_THREADS)
    } finally {
      setLoading(false)
    }
  }, [search, sort])

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [load, search])

  const handleVote = async (thread: ReturnType<typeof apiThreadToThread>, direction: 'up' | 'down') => {
    const delta = direction === 'up' ? 1 : -1
    setThreads((prev) =>
      prev.map((t) => (t.id === thread.id ? { ...t, votes: t.votes + delta } : t))
    )
    try {
      const res = await voteThread(thread.id, direction)
      const newCount = res.votes_count ?? thread.votes + delta
      setThreads((prev) =>
        prev.map((t) => (t.id === thread.id ? { ...t, votes: newCount } : t))
      )
    } catch {
      setThreads((prev) =>
        prev.map((t) => (t.id === thread.id ? { ...t, votes: t.votes - delta } : t))
      )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        title="Protocol Discussions"
        isDark={isDark}
        onToggleDarkMode={() => setTheme(isDark ? 'light' : 'dark')}
      />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Healing & Recovery Discussions
          </h1>
          <p className="text-muted-foreground text-lg">
            Community-powered platform for evidence-based healing protocols and recovery strategies.
          </p>
        </header>
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 mb-4">
            {error}. Ensure the Laravel API is running and NEXT_PUBLIC_API_URL is set.
          </div>
        )}
        <ThreadList
          threads={threads}
          loading={loading}
          onThreadClick={(t) => router.push(`/thread/${t.id}`)}
          onVote={handleVote}
        />
        {!loading && threads.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  sort === opt.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
