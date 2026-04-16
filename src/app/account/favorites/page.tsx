import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Product } from '@/types/database'

type FavoriteRow = {
  id: string
  created_at: string
  products: Product | null
}

export default async function FavoritesPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: favorites } = await supabase
    .from('favorites')
    .select('id, created_at, products(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const favoriteList = (favorites as unknown as FavoriteRow[]) || []

  return (
    <main className="min-h-screen px-8 py-16 max-w-3xl mx-auto">
      <nav className="mb-8 text-sm">
        <Link href="/account" className="text-[var(--text-tertiary)] hover:text-[var(--foreground)]">
          ← Back to account
        </Link>
      </nav>

      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Saved products</h1>
        <p className="text-[var(--text-tertiary)]">
          {favoriteList.length} {favoriteList.length === 1 ? 'product' : 'products'} saved
        </p>
      </header>

      {favoriteList.length === 0 ? (
        <div className="p-12 border border-dashed border-[var(--border-strong)] rounded-lg text-center">
          <p className="text-[var(--text-secondary)] mb-2">No saved products yet.</p>
          <p className="text-sm text-[var(--text-tertiary)] mb-6">
            Save products from their detail pages to see them here.
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full font-semibold hover:opacity-90 transition-colors"
          >
            Browse categories
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {favoriteList.map((fav) => {
            if (!fav.products) return null
            return (
              <Link
                key={fav.id}
                href={`/products/${fav.products.slug}`}
                className="block p-6 border border-[var(--border)] rounded-lg hover:border-gray-600 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{fav.products.name}</h3>
                    {fav.products.brand ? (
                      <p className="text-sm text-[var(--text-tertiary)] mt-1">{fav.products.brand}</p>
                    ) : null}
                  </div>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    Saved {new Date(fav.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
