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
    <header className="border-b border-gray-800">
      <div className="max-w-5xl mx-auto px-8 py-5 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Optimal Source
        </Link>
        <nav className="flex items-center gap-8 text-sm">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors">
            Categories
          </Link>
          <Link href="/highest-ranked" className="text-gray-400 hover:text-white transition-colors">
            Highest Ranked
          </Link>
          <Link href="/lab-reports" className="text-gray-400 hover:text-white transition-colors">
            Lab Reports
          </Link>
          <Link href="/methodology" className="text-gray-400 hover:text-white transition-colors">
            Methodology
          </Link>
          <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
            About
          </Link>
          {user ? (
            <HeaderUserMenu displayName={displayName} />
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
