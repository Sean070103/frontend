'use client'

import { useState, useMemo } from 'react'
import { Thread, ThreadCard } from './thread-card'
import { SearchInput } from './search-input'
import { SortDropdown, SortOption } from './sort-dropdown'
import { SkeletonThread } from './skeleton-loader'
import { EmptyState } from './empty-state'

interface ThreadListProps {
  threads: Thread[]
  loading?: boolean
  onThreadClick?: (thread: Thread) => void
}

export function ThreadList({ threads, loading = false, onThreadClick }: ThreadListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')

  const filteredAndSortedThreads = useMemo(() => {
    let filtered = threads.filter(thread =>
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        case 'most-voted':
          return b.votes - a.votes
        case 'trending':
          return (b.views + b.votes) - (a.views + a.votes)
        default:
          return 0
      }
    })

    return sorted
  }, [threads, searchQuery, sortBy])

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <SkeletonThread key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder="Search discussions by title, author, or category..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <SortDropdown value={sortBy} onChange={setSortBy} />
      </div>

      {/* Results Count */}
      {searchQuery && (
        <p className="text-sm text-muted-foreground">
          Found {filteredAndSortedThreads.length} discussion{filteredAndSortedThreads.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Thread List */}
      {filteredAndSortedThreads.length > 0 ? (
        <div className="space-y-3">
          {filteredAndSortedThreads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              onClick={() => onThreadClick?.(thread)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={searchQuery ? 'No discussions found' : 'No discussions yet'}
          description={
            searchQuery
              ? 'Try adjusting your search terms or browse all discussions'
              : 'Start a new discussion about healing protocols and recovery techniques'
          }
          icon="search"
          action={{
            label: 'Start Discussion',
            onClick: () => console.log('Start new discussion')
          }}
        />
      )}
    </div>
  )
}
