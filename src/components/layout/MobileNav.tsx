'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex items-center justify-center w-10 h-10 -ml-2"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="4" y1="4" x2="16" y2="16" />
            <line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        ) : (
          <svg width="22" height="16" viewBox="0 0 22 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="0" y1="1" x2="22" y2="1" />
            <line x1="0" y1="8" x2="22" y2="8" />
            <line x1="0" y1="15" x2="22" y2="15" />
          </svg>
        )}
      </button>

      {isOpen ? (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <nav className="fixed top-0 left-0 bottom-0 w-72 bg-[var(--background)] z-50 md:hidden shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <span className="font-serif text-xl font-medium text-[var(--foreground)]">TrueRank</span>
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center w-10 h-10"
                aria-label="Close menu"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col py-4">
              <Link
                href="/"
                className="px-6 py-3 text-base text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
              >
                Home
              </Link>
              <Link
                href="/lab-reports"
                className="px-6 py-3 text-base text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
              >
                Lab Reports
              </Link>
              <Link
                href="/methodology"
                className="px-6 py-3 text-base text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
              >
                Methodology
              </Link>
              <Link
                href="/about"
                className="px-6 py-3 text-base text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
              >
                About
              </Link>
            </div>
          </nav>
        </>
      ) : null}
    </>
  )
}
