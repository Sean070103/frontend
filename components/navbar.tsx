'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Sun, Moon } from 'lucide-react'

interface NavbarProps {
  title?: string
  onToggleDarkMode?: () => void
  isDark?: boolean
}

export function Navbar({ 
  title = 'Protocol Discussions', 
  onToggleDarkMode,
  isDark = true 
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Nav */}
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-foreground hover:opacity-90">
              {title}
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <Link href="/threads" className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                Threads
              </Link>
              <Link href="/protocols" className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
                Protocols
              </Link>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300 ease-out"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-300 ease-out"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-smooth"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t border-border/40">
            <Link href="/threads" className="block px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
              Threads
            </Link>
            <Link href="/protocols" className="block px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted" onClick={() => setIsMenuOpen(false)}>
              Protocols
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
