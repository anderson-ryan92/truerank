import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { HeaderUserMenu } from './HeaderUserMenu'

export async function Header() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  let displayName: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()
    displayName = profile?.display_name || user.email || null
  }

  return (
    <header className="border-b border-[var(--border)] bg-[var(--background)]">
      <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
        <Link href="/" className="font-serif text-2xl font-medium tracking-tight text-[var(--foreground)]">
          TrueRank
        </Link>
        <nav className="flex items-center gap-8 text-sm">
          <Link href="/lab-reports" className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">
            Lab Reports
          </Link>
          <Link href="/methodology" className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">
            Methodology
          </Link>
          <Link href="/about" className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">
            About
          </Link>
          {user ? (
            <HeaderUserMenu displayName={displayName} />
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
