import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Category, Product } from '@/types/database'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!category) {
    notFound()
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', (category as Category).id)
    .order('created_at', { ascending: false })

  const productList = (products as Product[]) || []

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <nav className="mb-8">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-300">
          ← All categories
        </Link>
      </nav>

      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2">{(category as Category).name}</h1>
        {(category as Category).description && (
          <p className="text-lg text-gray-500">{(category as Category).description}</p>
        )}
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-6">
          Products ({productList.length})
        </h2>

        {productList.length === 0 ? (
          <div className="p-12 border border-dashed border-gray-700 rounded-lg text-center">
            <p className="text-gray-500 mb-2">No products tested yet.</p>
            <p className="text-sm text-gray-600">
              Lab testing in progress. Results coming soon.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {productList.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="block p-6 border border-gray-200 rounded-lg hover:border-white transition-colors"
              >
                <h3 className="text-lg font-semibold">{product.name}</h3>
                {product.brand && (
                  <p className="text-sm text-gray-500">{product.brand}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
