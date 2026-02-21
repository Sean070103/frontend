'use client'

import { useState } from 'react'
import { ChevronDown, Heart, Reply, MoreHorizontal } from 'lucide-react'

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
}

export function CollapsibleComment({ 
  comment, 
  level = 0,
  onReply 
}: CollapsibleCommentProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [liked, setLiked] = useState(false)
  const hasReplies = comment.replies && comment.replies.length > 0
  const maxLevelDisplay = level < 3 // Only show replies up to 3 levels deep

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

        {/* Content */}
        <p className="text-sm text-foreground mb-3 leading-relaxed">
          {comment.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => setLiked(!liked)}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-300 ease-out ${
              liked
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
            <span>{comment.votes + (liked ? 1 : 0)}</span>
          </button>

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
