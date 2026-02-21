'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'

interface SearchInputProps {
  placeholder?: string
  onSearch?: (query: string) => void
  value?: string
  onChange?: (value: string) => void
}

export function SearchInput({ 
  placeholder = 'Search discussions...', 
  onSearch, 
  value = '',
  onChange 
}: SearchInputProps) {
  const [query, setQuery] = useState(value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setQuery(newValue)
    onChange?.(newValue)
  }

  const handleClear = () => {
    setQuery('')
    onChange?.('')
    onSearch?.('')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(query)
    }
  }

  return (
    <div className="relative w-full">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Search className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus-ring transition-all duration-300 ease-out"
      />

      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-300 ease-out"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
