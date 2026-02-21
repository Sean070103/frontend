'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Navbar } from '@/components/navbar'
import { SearchInput } from '@/components/search-input'
import { EmptyState } from '@/components/empty-state'
import { listProtocols, searchProtocols } from '@/lib/api'
import { apiProtocolToCard } from '@/lib/mappers'
import type { ApiProtocol, SortProtocols } from '@/lib/api-types'
import { MOCK_PROTOCOLS } from '@/lib/mock-data'
import { looksLikeLatin } from '@/lib/latin'
import { StarRating } from '@/components/star-rating'
import { MessageSquare, ThumbsUp, FileText } from 'lucide-react'

const SORT_OPTIONS: { value: SortProtocols; label: string }[] = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'most_reviewed', label: 'Most Reviews' },
  { value: 'top_rated', label: 'Top Rated' },
  { value: 'most_upvoted', label: 'Most Upvoted' },
]

export default function ProtocolsPage() {
  const { setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortProtocols>('recent')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<ReturnType<typeof apiProtocolToCard>[]>([])
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = search.trim()
        ? await searchProtocols({ q: search.trim(), sort })
        : await listProtocols({ sort })
      const data = Array.isArray(res) ? res : (res as { data?: ApiProtocol[] }).data ?? []
      const cards = data.map((p: ApiProtocol) => apiProtocolToCard(p))
      const useEnglish =
        cards.length === 0 ||
        cards.some((c) => looksLikeLatin(c.title) || looksLikeLatin(c.content))
      setItems(useEnglish ? MOCK_PROTOCOLS : cards)
      setTotal(useEnglish ? MOCK_PROTOCOLS.length : ((res as { meta?: { total?: number } })?.meta?.total ?? data.length))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load protocols')
      setItems(MOCK_PROTOCOLS)
      setTotal(MOCK_PROTOCOLS.length)
    } finally {
      setLoading(false)
    }
  }, [search, sort])

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0)
    return () => clearTimeout(t)
  }, [load, search])

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        title="Protocol Discussions"
        isDark={isDark}
        onToggleDarkMode={() => setTheme(isDark ? 'light' : 'dark')}
      />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">Protocols</h1>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <SearchInput
              placeholder="Search protocols by title or tags..."
              value={search}
              onChange={setSearch}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSort(opt.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  sort === opt.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground hover:bg-muted'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 mb-4">
            {error}. Ensure the Laravel API is running and NEXT_PUBLIC_API_URL is set.
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-28 rounded-lg bg-muted/50 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title={search ? 'No protocols found' : 'No protocols yet'}
            description={search ? 'Try a different search or sort.' : 'Protocols will appear here once the API is seeded.'}
            icon="search"
          />
        ) : (
          <>
            {search && (
              <p className="text-sm text-muted-foreground mb-4">
                Found {items.length} protocol{items.length !== 1 ? 's' : ''}
              </p>
            )}
            <div className="space-y-3">
              {items.map((p) => (
                <Link
                  key={p.id}
                  href={`/protocols/${p.id}`}
                  className="block p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                >
                  <h2 className="text-lg font-semibold text-foreground mb-1">{p.title}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{p.content}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {p.tags.length > 0 && (
                      <span className="flex gap-1 flex-wrap">
                        {p.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded bg-muted">
                            {tag}
                          </span>
                        ))}
                      </span>
                    )}
                    <span>{p.author}</span>
                    <StarRating rating={p.rating} size="sm" />
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {p.threadsCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {p.reviewsCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {p.votesCount}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
