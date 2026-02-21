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
  onShare 
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

  return (
    <div className="sticky top-20 flex flex-col gap-3 items-center py-4 px-3 rounded-lg border border-border bg-card/50 glass">
      <div className="flex flex-col gap-1 items-center">
        <button
          onClick={() => handleVote('up')}
          className={`p-2 rounded-md transition-all duration-300 ease-out ${
            voted === 'up'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
          aria-label="Upvote"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        
        <span className="text-sm font-semibold text-foreground min-w-8 text-center">
          {votes}
        </span>
        
        <button
          onClick={() => handleVote('down')}
          className={`p-2 rounded-md transition-all duration-300 ease-out ${
            voted === 'down'
              ? 'bg-destructive text-destructive-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
          aria-label="Downvote"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      <div className="w-8 h-px bg-border" />

      <button
        onClick={handleSave}
        className={`p-2 rounded-md transition-all duration-300 ease-out ${
          isSaved
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        }`}
        aria-label="Save"
      >
        <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
      </button>

      <button
        onClick={onShare}
        className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300 ease-out"
        aria-label="Share"
      >
        <Share2 className="w-5 h-5" />
      </button>
    </div>
  )
}
