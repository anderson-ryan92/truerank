'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

type Props = {
  initialDisplayName: string
  initialZipCode: string
}

export function EditProfileForm({ initialDisplayName, initialZipCode }: Props) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [zipCode, setZipCode] = useState(initialZipCode)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim() || null,
        zip_code: zipCode.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
  setMessage({ type: 'error', text: error.message })
  setIsLoading(false)
} else {
  router.refresh()
  router.push('/account')
}
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Display name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How you want to appear on the site"
          maxLength={80}
          className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-[var(--foreground)] placeholder-gray-600 focus:outline-none focus:border-gray-600"
        />
      </div>

      <div>
        <label htmlFor="zipCode" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Zip code
        </label>
        <input
          id="zipCode"
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="78701"
          maxLength={10}
          className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-[var(--foreground)] placeholder-gray-600 focus:outline-none focus:border-gray-600"
        />
        <p className="text-xs text-gray-600 mt-2">
          Used for local tap water quality and store recommendations. Not shared publicly.
        </p>
      </div>

      {message ? (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'error'
              ? 'bg-red-950 border border-red-900 text-red-400'
              : 'bg-green-950 border border-green-900 text-green-400'
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save changes'}
        </button>
        <Link
          href="/account"
          className="px-6 py-3 text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}
