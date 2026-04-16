import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { Product } from '@/types/database'

export default async function AdminPage() {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

  const { data: untestedProducts, count: untestedCount } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('is_tested', false)
    .order('created_at', { ascending: false })
    .limit(20)

  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  const { count: totalLabReports } = await supabase
    .from('lab_reports')
    .select('*', { count: 'exact', head: true })

  const { count: totalScores } = await supabase
    .from('scores')
    .select('*', { count: 'exact', head: true })

  const products = (untestedProducts as Product[]) || []

  return (
    <main className="min-h-screen px-8 py-16 max-w-5xl mx-auto">
      <header className="mb-12">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Admin</p>
        <h1 className="text-4xl font-bold mb-2">Control Panel</h1>
        <p className="text-gray-500">Manage products, lab reports, and scores.</p>
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
            className="block p-6 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors"
          >
            <h3 className="font-semibold mb-1">Add a product</h3>
            <p className="text-sm text-gray-500">Create a new product entry</p>
          </Link>
          <div className="block p-6 border border-gray-800 rounded-lg opacity-50">
            <h3 className="font-semibold mb-1">Add a lab report</h3>
            <p className="text-sm text-gray-500">Select a product below</p>
          </div>
          <div className="block p-6 border border-gray-800 rounded-lg opacity-50">
            <h3 className="font-semibold mb-1">Set scores</h3>
            <p className="text-sm text-gray-500">Select a product below</p>
          </div>
          <Link
            href="/"
            className="block p-6 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors"
          >
            <h3 className="font-semibold mb-1">Back to site</h3>
            <p className="text-sm text-gray-500">Return to public home page</p>
          </Link>
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            Untested products
          </h2>
          <span className="text-xs text-gray-600">
            Showing {products.length} of {untestedCount || 0}
          </span>
        </div>

        {products.length === 0 ? (
          <div className="p-8 border border-dashed border-gray-700 rounded-lg text-center text-gray-500">
            No untested products.
          </div>
        ) : (
          <div className="space-y-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="p-4 border border-gray-800 rounded-lg flex items-center justify-between hover:border-gray-600 transition-colors"
              >
                <div>
                  <p className="font-medium">{product.name}</p>
                  {product.brand ? (
                    <p className="text-xs text-gray-500">{product.brand}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Link
                    href={`/admin/products/${product.slug}/details`}
                    className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
                  >
                    Edit details
                  </Link>
                  <Link
                    href={`/admin/products/${product.slug}/lab-report`}
                    className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
                  >
                    + Lab report
                  </Link>
                  <Link
                    href={`/admin/products/${product.slug}/score`}
                    className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
                  >
                    + Score
                  </Link>
                  <Link
                    href={`/products/${product.slug}`}
                    className="text-xs text-gray-600 hover:text-[var(--text-secondary)] transition-colors"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 border border-gray-800 rounded-lg">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}
