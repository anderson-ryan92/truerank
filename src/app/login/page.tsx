'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [showEmailForm, setShowEmailForm] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  async function handleGoogleSignIn() {
    setIsLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      setMessage({ type: 'error', text: error.message })
      setIsLoading(false)
    }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({
        type: 'success',
        text: 'Check your email for a login link.',
      })
    }
    setIsLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="font-serif text-2xl font-medium text-[var(--foreground)]">TrueRank</span>
          </Link>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Welcome back</h1>
          <p className="text-[var(--text-tertiary)] mt-2">Sign in to TrueRank</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <button
            disabled
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[var(--background)] border border-[var(--border)] text-[var(--text-tertiary)] rounded-full font-semibold cursor-not-allowed"
          >
            <AppleIcon />
            Continue with Apple
            <span className="text-xs text-[var(--text-tertiary)]">(soon)</span>
          </button>

          <div className="flex items-center gap-3 py-2">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--text-tertiary)]">OR</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {!showEmailForm ? (
            <button
              onClick={() => setShowEmailForm(true)}
              className="w-full text-center py-3 text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              Continue with email
            </button>
          ) : (
            <form onSubmit={handleEmailSignIn} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-full text-[var(--foreground)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--border-strong)]"
              />
              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full px-4 py-3 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isLoading ? 'Sending...' : 'Send magic link'}
              </button>
            </form>
          )}

          {message ? (
            <div
              className={`mt-3 p-3 rounded-lg text-sm ${
                message.type === 'error'
                  ? 'bg-[var(--bad-bg)] border border-[var(--bad)] text-[var(--bad)]'
                  : 'bg-[var(--good-bg)] border border-[var(--good)] text-[var(--good)]'
              }`}
            >
              {message.text}
            </div>
          ) : null}
        </div>

        <p className="text-center text-xs text-[var(--text-tertiary)] mt-6">
          By continuing, you agree to our terms and privacy policy.
        </p>
      </div>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  )
}
