'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

interface CommentFormProps {
  onSubmit?: (content: string) => void
  placeholder?: string
  isReply?: boolean
  onCancel?: () => void
}

export function CommentForm({ 
  onSubmit, 
  placeholder = 'Share your thoughts...',
  isReply = false,
  onCancel 
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      onSubmit?.(content.trim())
      setContent('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3">
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=you"
          alt="Your avatar"
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              if (!content) setIsFocused(false)
            }}
            placeholder={placeholder}
            rows={isFocused ? 3 : 1}
            className="w-full px-4 py-2 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
          />
        </div>
      </div>

      {isFocused && (
        <div className="flex items-center justify-end gap-2">
          {isReply && (
            <button
              type="button"
              onClick={() => {
                setContent('')
                setIsFocused(false)
                onCancel?.()
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-all duration-300 ease-out"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!content.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all duration-300 ease-out"
          >
            <Send className="w-4 h-4" />
            Post
          </button>
        </div>
      )}
    </form>
  )
}
