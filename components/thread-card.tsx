'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { MessageSquare, Eye, Loader2 } from 'lucide-react'
import { StarRating } from './star-rating'
import { voteStorage } from '@/lib/vote-storage'
import { toast } from '@/hooks/use-toast'
import { getApiErrorMessage } from '@/lib/api'

export interface Thread {
  id: string
  title: string
  author: string
  avatar: string
  category: string
  excerpt: string
  votes: number
  replies: number
  views: number
  rating: number
  timestamp: string
}

interface ThreadCardProps {
  thread: Thread
  onClick?: () => void
  onVote?: (threadId: string, direction: 'up' | 'down') => void | Promise<void>
}

function formatTimeAgo(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    return formatDistanceToNow(d, { addSuffix: true, locale: enUS })
  } catch {
    return iso
  }
}

export function ThreadCard({ thread, onClick, onVote }: ThreadCardProps) {
  const timeAgo = formatTimeAgo(thread.timestamp)
  const [voted, setVoted] = useState<'up' | 'down' | null>(null)
  const [voting, setVoting] = useState(false)

  useEffect(() => {
    const stored = voteStorage.getThreadVote(thread.id)
    if (stored) setVoted(stored)
  }, [thread.id])

  const handleVote = async (e: React.MouseEvent, direction: 'up' | 'down') => {
    e.stopPropagation()
    if (voted === direction || voting) return
    setVoting(true)
    try {
      const result = onVote?.(thread.id, direction)
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        await (result as Promise<void>)
      }
      setVoted(direction)
      voteStorage.setThreadVote(thread.id, direction)
    } catch (err) {
      toast({
        title: 'Vote failed',
        description: getApiErrorMessage(err),
        variant: 'destructive',
      })
    } finally {
      setVoting(false)
    }
  }

  return (
    <div
      onClick={onClick}
      className="group p-5 rounded-xl bg-card border border-border cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-200"
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <img
            src={thread.avatar}
            alt={thread.author}
            className="w-12 h-12 rounded-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <p className="text-sm font-medium text-foreground">{thread.author}</p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
            </div>
            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground whitespace-nowrap">
              {thread.category}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {thread.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
            {thread.excerpt}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <StarRating rating={thread.rating} size="sm" />
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                {thread.replies}
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                {thread.views}
              </span>
              {onVote && (
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(e) => handleVote(e, 'up')}
                    disabled={voting}
                    title={voted === 'up' ? 'You marked helpful' : 'Helpful'}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none ${
                      voted === 'up'
                        ? 'bg-primary text-primary-foreground cursor-default'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    aria-label={voted === 'up' ? 'You marked helpful' : 'Helpful'}
                  >
                    {voting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Vote</span>}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleVote(e, 'down')}
                    disabled={voting}
                    title={voted === 'down' ? 'You marked not helpful' : 'Not helpful'}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none ${
                      voted === 'down'
                        ? 'bg-destructive/90 text-destructive-foreground cursor-default'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    aria-label={voted === 'down' ? 'You marked not helpful' : 'Not helpful'}
                  >
                    <span>Not helpful</span>
                  </button>
                  <span className="ml-0.5 text-sm font-medium tabular-nums text-foreground" aria-label="Vote count">{thread.votes}</span>
                </div>
              )}
              {!onVote && (
                <span className="flex items-center gap-1.5">{thread.votes} votes</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
