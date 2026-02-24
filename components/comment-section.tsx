'use client'

import { useState } from 'react'
import { Comment, CollapsibleComment } from './collapsible-comment'
import { CommentForm } from './comment-form'
import { SkeletonComment } from './skeleton-loader'

interface CommentSectionProps {
  comments: Comment[]
  onCommentSubmit?: (content: string) => void
  onReply?: (parentId: string, content: string) => void
  onVoteComment?: (commentId: string, direction: 'up' | 'down') => void
  loading?: boolean
  totalCount?: number
}

export function CommentSection({
  comments,
  onCommentSubmit,
  onReply,
  onVoteComment,
  loading = false,
  totalCount,
}: CommentSectionProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'top'>('newest')

  const handleCommentSubmit = (content: string) => {
    onCommentSubmit?.(content)
  }

  const handleReplySubmit = (content: string) => {
    if (replyingTo) {
      onReply?.(replyingTo, content)
      setReplyingTo(null)
    }
  }

  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      case 'oldest':
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      case 'top':
        return b.votes - a.votes
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <SkeletonComment key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Sort */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">
          Discussion {totalCount ? `(${totalCount})` : ''}
        </h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus-ring cursor-pointer"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="top">Top Comments</option>
        </select>
      </div>

      {/* New Comment Form */}
      <div className="p-4 rounded-lg bg-muted/30 border border-border">
        <CommentForm
          onSubmit={handleCommentSubmit}
          placeholder="Share your insights and experiences..."
        />
      </div>

      {/* Comments List */}
      {sortedComments.length > 0 ? (
        <div className="space-y-4">
          {sortedComments.map((comment) => (
            <CollapsibleComment
              key={comment.id}
              comment={comment}
              onReply={() => setReplyingTo(comment.id)}
              onVote={onVoteComment}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      )}
    </div>
  )
}
