'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

type Props = {
  productId: string
}

export function SaveButton({ productId }: Props) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    async function checkState() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      setIsAuthenticated(true)

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle()

      setIsSaved(!!data)
      setIsLoading(false)
    }

    checkState()
  }, [productId, supabase])

  async function handleToggle() {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    if (isSaved) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId)

      if (!error) setIsSaved(false)
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, product_id: productId })

      if (!error) setIsSaved(true)
    }

    setIsLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
        isSaved
          ? 'bg-white text-black border-white'
          : 'bg-transparent text-[var(--foreground)] border-gray-700 hover:border-white'
      } disabled:opacity-50`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      </svg>
      {isSaved ? 'Saved' : 'Save'}
    </button>
  )
}
