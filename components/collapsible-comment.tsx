'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Reply, MoreHorizontal, Loader2 } from 'lucide-react'
import { voteStorage } from '@/lib/vote-storage'
import { toast } from '@/hooks/use-toast'
import { getApiErrorMessage } from '@/lib/api'

export interface Comment {
  id: string
  author: string
  avatar: string
  content: string
  timestamp: string
  votes: number
  replies?: Comment[]
}

interface CollapsibleCommentProps {
  comment: Comment
  level?: number
  onReply?: (parentId: string) => void
  onVote?: (commentId: string, direction: 'up' | 'down') => void | Promise<void>
  voteLoadingId?: string | null
}

export function CollapsibleComment({
  comment,
  level = 0,
  onReply,
  onVote,
  voteLoadingId = null,
}: CollapsibleCommentProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [voted, setVoted] = useState<'up' | 'down' | null>(null)
  const [voting, setVoting] = useState(false)
  const hasReplies = comment.replies && comment.replies.length > 0
  const maxLevelDisplay = level < 3
  const voteLoading = voting || voteLoadingId === comment.id

  useEffect(() => {
    const stored = voteStorage.getCommentVote(comment.id)
    if (stored) setVoted(stored)
  }, [comment.id])

  const handleVote = async (direction: 'up' | 'down') => {
    if (voted === direction || voting) return
    setVoting(true)
    try {
      const result = onVote?.(comment.id, direction)
      if (result && typeof (result as Promise<unknown>).then === 'function') {
        await (result as Promise<void>)
      }
      setVoted(direction)
      voteStorage.setCommentVote(comment.id, direction)
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
    <div className={`space-y-2 ${level > 0 ? 'ml-4 sm:ml-6' : ''}`}>
      {/* Comment Container */}
      <div className="p-4 rounded-xl bg-card border border-border/50 hover:border-border transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <img
              src={comment.avatar}
              alt={comment.author}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {comment.author}
              </p>
              <p className="text-xs text-muted-foreground">
                {comment.timestamp}
              </p>
            </div>
          </div>
          <button className="p-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Content - div to avoid hydration from invalid nesting if content has block-like text */}
        <div className="text-sm text-foreground mb-3 leading-relaxed">
          {comment.content}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          {onVote && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={voteLoading}
                onClick={() => handleVote('up')}
                title={voted === 'up' ? 'You marked helpful' : 'Helpful'}
                className={`min-w-[1.75rem] min-h-[1.75rem] flex items-center justify-center rounded-full text-[10px] font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none ${
                  voted === 'up'
                    ? 'bg-primary text-primary-foreground cursor-default'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                aria-label={voted === 'up' ? 'You marked helpful' : 'Helpful'}
              >
                {voteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '↑'}
              </button>
              <button
                type="button"
                disabled={voteLoading}
                onClick={() => handleVote('down')}
                title={voted === 'down' ? 'You marked not helpful' : 'Not helpful'}
                className={`min-w-[1.75rem] min-h-[1.75rem] flex items-center justify-center rounded-full text-[10px] font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none ${
                  voted === 'down'
                    ? 'bg-destructive/90 text-destructive-foreground cursor-default'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                aria-label={voted === 'down' ? 'You marked not helpful' : 'Not helpful'}
              >
                {voteLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '↓'}
              </button>
              <span className="tabular-nums text-sm font-semibold text-foreground min-w-[1.25rem] text-center" aria-label="Vote count">{comment.votes}</span>
              <span className="text-muted-foreground text-[10px]">votes</span>
            </div>
          )}
          {!onVote && (
            <span className="text-muted-foreground tabular-nums font-medium">{comment.votes} votes</span>
          )}

          <span className="h-4 w-px bg-border hidden sm:block" aria-hidden />

          <button
            type="button"
            title="Reply to this comment"
            onClick={() => onReply?.(comment.id)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
            aria-label="Reply to this comment"
          >
            <Reply className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>

          {hasReplies && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-primary hover:bg-primary/10 transition-all duration-300 ease-out"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              <span className="tabular-nums">{comment.replies?.length} {comment.replies?.length === 1 ? 'reply' : 'replies'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {hasReplies && isExpanded && maxLevelDisplay && (
        <div className="space-y-2">
          {comment.replies!.map((reply) => (
            <CollapsibleComment
              key={reply.id}
              comment={reply}
              level={level + 1}
              onReply={onReply}
              onVote={onVote}
              voteLoadingId={voteLoadingId}
            />
          ))}
        </div>
      )}

      {/* Collapsed Indicator */}
      {hasReplies && !isExpanded && (
        <div className="ml-4 sm:ml-6 text-xs text-muted-foreground px-3 py-2 rounded-xl bg-muted/30">
          {comment.replies?.length} {comment.replies?.length === 1 ? 'reply' : 'replies'} hidden
        </div>
      )}
    </div>
  )
}
