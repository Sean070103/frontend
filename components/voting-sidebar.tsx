'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, Share2, Bookmark } from 'lucide-react'

interface VotingSidebarProps {
  votes: number
  onVote?: (direction: 'up' | 'down') => void
  saved?: boolean
  onSave?: () => void
  onShare?: () => void
}

export function VotingSidebar({
  votes,
  onVote,
  saved = false,
  onSave,
  onShare,
}: VotingSidebarProps) {
  const [voted, setVoted] = useState<'up' | 'down' | null>(null)
  const [isSaved, setIsSaved] = useState(saved)

  const handleVote = (direction: 'up' | 'down') => {
    if (voted === direction) {
      setVoted(null)
    } else {
      setVoted(direction)
    }
    onVote?.(direction)
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    onSave?.()
  }

  const btnBase =
    'min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'

  return (
    <div className="sticky top-20 flex flex-col items-center gap-4 py-5 px-4 rounded-xl border border-border bg-card shadow-sm backdrop-blur-sm">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Vote</p>
      <div className="flex flex-col gap-1 items-center">
        <button
          type="button"
          title="Upvote — this was helpful"
          onClick={() => handleVote('up')}
          className={`${btnBase} ${
            voted === 'up'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
          aria-label="Upvote — this was helpful"
        >
          <ChevronUp className="w-6 h-6" strokeWidth={2.5} />
        </button>
        <span className="text-base font-bold text-foreground min-w-[2rem] text-center tabular-nums py-0.5" aria-label="Vote count">
          {votes}
        </span>
        <button
          type="button"
          title="Downvote — not helpful"
          onClick={() => handleVote('down')}
          className={`${btnBase} ${
            voted === 'down'
              ? 'bg-destructive/90 text-destructive-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
          aria-label="Downvote — not helpful"
        >
          <ChevronDown className="w-6 h-6" strokeWidth={2.5} />
        </button>
      </div>

      <div className="w-10 h-px bg-border" />

      <div className="flex flex-col gap-1 items-center">
        <button
          type="button"
          title={isSaved ? 'Unsave' : 'Save for later'}
          onClick={handleSave}
          className={`${btnBase} ${
            isSaved
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
          aria-label={isSaved ? 'Unsave' : 'Save for later'}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
        <button
          type="button"
          title="Share"
          onClick={onShare}
          className={`${btnBase} text-muted-foreground hover:bg-muted hover:text-foreground`}
          aria-label="Share"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
