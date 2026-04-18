import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { AdminProductList } from '@/components/AdminProductList'
import type { Product } from '@/types/database'

export default async function AdminPage() {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

  const { data: allProducts } = await supabase
    .from('products')
    .select('*')
    .order('name', { ascending: true })

  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { count: untestedCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_tested', false)

  const { count: totalLabReports } = await supabase
    .from('lab_reports')
    .select('*', { count: 'exact', head: true })

  const { count: totalScores } = await supabase
    .from('scores')
    .select('*', { count: 'exact', head: true })

  const products = (allProducts as Product[]) || []

  return (
    <main className="min-h-screen px-8 py-16 max-w-5xl mx-auto">
      <header className="mb-12">
        <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wide mb-2">Admin</p>
        <h1 className="text-4xl font-bold mb-2">Control Panel</h1>
        <p className="text-[var(--text-tertiary)]">Manage products, lab reports, and scores.</p>
      </header>

      <section className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total products" value={totalProducts || 0} />
        <Stat label="Untested" value={untestedCount || 0} />
        <Stat label="Lab reports" value={totalLabReports || 0} />
        <Stat label="Scored" value={totalScores || 0} />
      </section>

      <section className="mb-12">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-4">Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/products/new"
            className="block p-6 border border-[var(--border)] rounded-lg hover:border-[var(--border-strong)] transition-colors"
          >
            <h3 className="font-semibold mb-1">Add a product</h3>
            <p className="text-sm text-[var(--text-tertiary)]">Create a new product entry</p>
          </Link>
          <Link
            href="/"
            className="block p-6 border border-[var(--border)] rounded-lg hover:border-[var(--border-strong)] transition-colors"
          >
            <h3 className="font-semibold mb-1">Back to site</h3>
            <p className="text-sm text-[var(--text-tertiary)]">Return to public home page</p>
          </Link>
        </div>
      </section>

      <AdminProductList products={products} />
    </main>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 border border-[var(--border)] rounded-lg">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-[var(--text-tertiary)] mt-1">{label}</p>
    </div>
  )
}
