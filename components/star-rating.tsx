'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  count?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (rating: number) => void
}

export function StarRating({ 
  rating, 
  count, 
  size = 'md', 
  interactive = false,
  onChange 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedRating, setSelectedRating] = useState(rating)
  useEffect(() => {
    setSelectedRating(rating)
  }, [rating])

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const handleClick = (index: number) => {
    if (interactive) {
      const newRating = index + 1
      setSelectedRating(newRating)
      onChange?.(newRating)
    }
  }

  const displayRating = hoverRating || selectedRating
  const baseColor = displayRating > 3 ? 'text-yellow-400' : displayRating > 1 ? 'text-yellow-300' : 'text-muted-foreground'

  return (
    <div className="flex items-center gap-2">
      <div 
        className="flex gap-1"
        onMouseLeave={() => setHoverRating(0)}
      >
        {[...Array(5)].map((_, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            onMouseEnter={() => interactive && setHoverRating(i + 1)}
            className={`transition-all duration-300 ease-out ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
            disabled={!interactive}
            aria-label={`Rate ${i + 1} out of 5`}
          >
            <Star
              className={`${sizeClasses[size]} transition-all duration-300 ease-out ${
                i < displayRating
                  ? `${baseColor} fill-current`
                  : 'text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>
      {count !== undefined && (
        <span className="text-sm text-muted-foreground">
          ({count})
        </span>
      )}
    </div>
  )
}
