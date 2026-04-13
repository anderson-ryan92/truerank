'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

type Props = {
  displayName: string | null
}

export function HeaderUserMenu({ displayName }: Props) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  const initial = (displayName?.[0] || '?').toUpperCase()

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-sm font-semibold hover:bg-gray-600 transition-colors"
      >
        {initial}
      </button>
      {isOpen ? (
        <div className="absolute right-0 mt-2 w-56 bg-gray-950 border border-gray-800 rounded-lg shadow-2xl overflow-hidden z-50">
          {displayName ? (
            <div className="px-4 py-3 border-b border-gray-800">
              <p className="text-sm font-medium truncate">{displayName}</p>
            </div>
          ) : null}
          <Link
            href="/account"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm hover:bg-gray-900 transition-colors"
          >
            Account
          </Link>
          <Link
            href="/account/favorites"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm hover:bg-gray-900 transition-colors"
          >
            Saved products
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-900 transition-colors border-t border-gray-800"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}
