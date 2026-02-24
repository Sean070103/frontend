'use client'

import { useState, useEffect } from 'react'
import { Share2, Bookmark, Loader2 } from 'lucide-react'
import { voteStorage } from '@/lib/vote-storage'
import { toast } from '@/hooks/use-toast'
import { getApiErrorMessage } from '@/lib/api'

interface VotingSidebarProps {
  threadId: string
  votes: number
  onVote?: (direction: 'up' | 'down') => void | Promise<void>
  saved?: boolean
  onSave?: () => void
  onShare?: () => void
  disabled?: boolean
}

export function VotingSidebar({
  threadId,
  votes,
  onVote,
  saved = false,
  onSave,
  onShare,
  disabled = false,
}: VotingSidebarProps) {
  const [voted, setVoted] = useState<'up' | 'down' | null>(null)
  const [voting, setVoting] = useState(false)
  const [isSaved, setIsSaved] = useState(saved)

  useEffect(() => {
    const stored = voteStorage.getThreadVote(threadId)
    if (stored) setVoted(stored)
  }, [threadId])

  const handleVote = async (direction: 'up' | 'down') => {
    if (disabled || voting || voted === direction) return
    setVoting(true)
    try {
      const result = onVote?.(direction)
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        await (result as Promise<void>)
      }
      setVoted(direction)
      voteStorage.setThreadVote(threadId, direction)
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

  const handleSave = () => {
    setIsSaved(!isSaved)
    onSave?.()
  }

  const btnBase =
    'min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'

  return (
    <div className="sticky top-20 flex flex-col items-center gap-5 py-5 px-4 rounded-xl border border-border bg-card shadow-sm backdrop-blur-sm min-w-[6rem]">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Vote</p>
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={() => handleVote('up')}
            disabled={disabled || voting}
            title={voted === 'up' ? 'You marked helpful' : 'Helpful'}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 rounded-full min-h-[2.5rem] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none ${
              voted === 'up'
                ? 'bg-primary text-primary-foreground cursor-default'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            aria-label={voted === 'up' ? 'You marked helpful' : 'Helpful'}
          >
            {voting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="text-[10px] font-semibold leading-none">↑</span>}
          </button>
          <button
            type="button"
            onClick={() => handleVote('down')}
            disabled={disabled || voting}
            title={voted === 'down' ? 'You marked not helpful' : 'Not helpful'}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 rounded-full min-h-[2.5rem] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none ${
              voted === 'down'
                ? 'bg-destructive/90 text-destructive-foreground cursor-default'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            aria-label={voted === 'down' ? 'You marked not helpful' : 'Not helpful'}
          >
            <span className="text-[10px] font-semibold leading-none">↓</span>
          </button>
        </div>
        {voting && <p className="text-xs text-muted-foreground">Saving…</p>}
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold tabular-nums text-foreground" aria-label="Vote count">{votes}</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">votes</span>
        </div>
      </div>

      <div className="w-full h-px bg-border" />

      <div className="flex flex-col gap-2 items-center w-full">
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
