'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { ThreadList } from '@/components/thread-list'
import { listThreads } from '@/lib/api'
import { apiThreadToThread } from '@/lib/mappers'
import { MOCK_THREADS, getThread as getMockThread } from '@/lib/mock-data'
import { looksLikeLatin } from '@/lib/latin'

export default function Home() {
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [threads, setThreads] = useState<ReturnType<typeof apiThreadToThread>[]>([])
  const [loading, setLoading] = useState(true)
  const [useApi, setUseApi] = useState(true)

  useEffect(() => {
    setLoading(true)
    listThreads({ sort: 'recent' })
      .then((res) => {
        const list = Array.isArray(res) ? res : (res as { data?: unknown[] })?.data ?? []
        setThreads(list.map((t) => apiThreadToThread(t as import('@/lib/api-types').ApiThread)))
        setUseApi(true)
      })
      .catch(() => {
        setThreads([])
        setUseApi(false)
      })
      .finally(() => setLoading(false))
  }, [])

  // Replace any thread with lorem/Latin-looking content with English mock data
  const displayThreads =
    threads.length > 0
      ? threads.map((t, index) => {
          if (looksLikeLatin(t.title) || looksLikeLatin(t.excerpt)) {
            const fallback =
              getMockThread(t.id) ?? MOCK_THREADS[index % MOCK_THREADS.length]

            // Keep the real thread id and numeric stats, but use English text/avatar/category
            return {
              ...t,
              title: fallback.title,
              excerpt: fallback.excerpt,
              author: fallback.author,
              avatar: fallback.avatar,
              category: fallback.category,
            }
          }
          return t
        })
      : MOCK_THREADS

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
          <div className="flex flex-wrap gap-3 mt-4">
            <Link
              href="/protocols"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
            >
              Browse Protocols
            </Link>
            <Link
              href="/threads"
              className="px-4 py-2 rounded-lg bg-card border border-border text-foreground text-sm font-medium hover:bg-muted"
            >
              All Threads
            </Link>
          </div>
        </header>
        <ThreadList
          threads={displayThreads}
          loading={loading}
          onThreadClick={(thread) => router.push(`/thread/${thread.id}`)}
        />
      </main>
    </div>
  )
}
