import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Category } from '@/types/database'

export default async function HomePage() {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    return (
      <main className="min-h-screen p-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Error loading categories</h1>
        <pre className="text-sm text-red-500">{error.message}</pre>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-5xl font-bold mb-4">Optimal Source</h1>
        <p className="text-xl text-gray-600">
          Independent lab testing. Full chain of custody. Real data.
        </p>
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(categories as Category[]).map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="block p-6 border border-gray-200 rounded-lg hover:border-black transition-colors"
            >
              <h3 className="text-xl font-semibold mb-1">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-600">{category.description}</p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
