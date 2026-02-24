'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Reply, MoreHorizontal } from 'lucide-react'

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
  onVote?: (commentId: string, direction: 'up' | 'down') => void
}

export function CollapsibleComment({
  comment,
  level = 0,
  onReply,
  onVote,
}: CollapsibleCommentProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [voted, setVoted] = useState<'up' | 'down' | null>(null)
  const hasReplies = comment.replies && comment.replies.length > 0
  const maxLevelDisplay = level < 3

  return (
    <div className={`space-y-2 ${level > 0 ? 'ml-4 sm:ml-6' : ''}`}>
      {/* Comment Container */}
      <div className="p-3 rounded-lg bg-card border border-border/50 hover:border-border transition-colors">
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
        <div className="flex items-center gap-3 text-xs">
          {onVote && (
            <div className="flex items-center gap-0.5 rounded-md bg-muted/50 p-0.5">
              <button
                type="button"
                title="Upvote — helpful"
                onClick={() => {
                  const next = voted === 'up' ? null : 'up'
                  setVoted(next)
                  if (next) onVote(comment.id, next)
                }}
                className={`min-w-[1.75rem] min-h-[1.75rem] flex items-center justify-center rounded transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
                  voted === 'up'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                aria-label="Upvote — helpful"
              >
                <ChevronUp className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <span className="min-w-[1.5rem] text-center text-foreground font-medium tabular-nums text-xs" aria-label="Vote count">
                {comment.votes}
              </span>
              <button
                type="button"
                title="Downvote — not helpful"
                onClick={() => {
                  const next = voted === 'down' ? null : 'down'
                  setVoted(next)
                  if (next) onVote(comment.id, next)
                }}
                className={`min-w-[1.75rem] min-h-[1.75rem] flex items-center justify-center rounded transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 ${
                  voted === 'down'
                    ? 'bg-destructive/90 text-destructive-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                aria-label="Downvote — not helpful"
              >
                <ChevronDown className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          )}
          {!onVote && (
            <span className="text-muted-foreground">{comment.votes} votes</span>
          )}

          <button
            onClick={() => onReply?.(comment.id)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300 ease-out"
          >
            <Reply className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>

          {hasReplies && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-auto flex items-center gap-1 px-2 py-1 rounded-md text-primary hover:bg-primary/10 transition-all duration-300 ease-out"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              <span>{comment.replies?.length} {comment.replies?.length === 1 ? 'reply' : 'replies'}</span>
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
            />
          ))}
        </div>
      )}

      {/* Collapsed Indicator */}
      {hasReplies && !isExpanded && (
        <div className="ml-4 sm:ml-6 text-xs text-muted-foreground p-2 rounded-lg bg-muted/30">
          {comment.replies?.length} {comment.replies?.length === 1 ? 'reply' : 'replies'} hidden
        </div>
      )}
    </div>
  )
}
