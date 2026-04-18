import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { HeaderUserMenu } from './HeaderUserMenu'
import { MobileNav } from './MobileNav'

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
    <header className="bg-[var(--background)]">
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-4 md:py-5">
        {/* Mobile header: hamburger | TR logo | user action */}
        <div className="flex md:hidden items-center justify-between relative">
          <MobileNav />
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
            <span className="font-serif text-2xl font-medium tracking-tight text-[var(--foreground)]">TR</span>
          </Link>
          <div>
            {user ? (
              <HeaderUserMenu displayName={displayName} />
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-[var(--foreground)] hover:opacity-70 transition-opacity"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
        {/* Desktop header: logo | nav links + user */}
        <div className="hidden md:flex items-center justify-between gap-4">
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
      </div>
      {/* Divider line below header */}
      <div className="border-b border-[var(--border)]" />
    </header>
  )
}
