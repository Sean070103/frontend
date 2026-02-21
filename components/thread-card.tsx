'use client'

import { formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { MessageSquare, Eye, Heart } from 'lucide-react'
import { StarRating } from './star-rating'

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

export function ThreadCard({ thread, onClick }: ThreadCardProps) {
  const timeAgo = formatTimeAgo(thread.timestamp)

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
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4" />
                {thread.votes}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
