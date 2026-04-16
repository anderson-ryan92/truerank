import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { count: favoritesCount } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  return (
    <main className="min-h-screen px-8 py-16 max-w-3xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Account</h1>
        <p className="text-[var(--text-tertiary)]">Manage your profile and preferences.</p>
      </header>

      <section className="mb-12">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">Profile</h2>
        <div className="space-y-4 border border-[var(--border)] rounded-lg p-6">
          <Field label="Email" value={user.email || '—'} />
          <Field label="Display name" value={profile?.display_name || '—'} />
          <Field label="Zip code" value={profile?.zip_code || 'Not set'} />
          <Field label="Membership" value={profile?.membership_tier === 'pro' ? 'Pro' : 'Free'} />
          <Field label="Member since" value={new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
        </div>
        <Link
          href="/account/edit"
          className="inline-block mt-4 text-sm text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
        >
          Edit profile →
        </Link>
      </section>

      <section className="mb-12">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">Quick links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/account/favorites" className="block p-6 border border-[var(--border)] rounded-lg hover:border-gray-600 transition-colors">
            <h3 className="font-semibold mb-1">Saved products</h3>
            <p className="text-sm text-[var(--text-tertiary)]">{favoritesCount || 0} saved</p>
          </Link>
          <Link href="/account/history" className="block p-6 border border-[var(--border)] rounded-lg hover:border-gray-600 transition-colors">
            <h3 className="font-semibold mb-1">View history</h3>
            <p className="text-sm text-[var(--text-tertiary)]">Products you have viewed</p>
          </Link>
        </div>
      </section>

      {profile?.membership_tier !== 'pro' ? (
        <section className="p-6 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
          <h3 className="font-semibold mb-2">Upgrade to Pro</h3>
          <p className="text-sm text-[var(--text-tertiary)] mb-4">
            Get personalized recommendations, real-time alerts when products you use get new test results,
            and detailed comparison tools.
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">Coming soon.</p>
        </section>
      ) : null}
    </main>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-[var(--text-tertiary)]">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}
