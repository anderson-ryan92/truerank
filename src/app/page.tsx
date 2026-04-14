import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { SearchBar } from '@/components/SearchBar'
import type { Category, Product, Score } from '@/types/database'

type ProductWithScores = Product & { scores: Score[] }

type CategoryWithTop = {
  category: Category
  topProduct: ProductWithScores | null
  topScore: number | null
  rankedCount: number
}

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

  const categoryList = (categories as Category[]) || []

  const enriched: CategoryWithTop[] = await Promise.all(
    categoryList.map(async (cat) => {
      const { data: products } = await supabase
        .from('products')
        .select('*, scores(overall_score, calculated_at)')
        .eq('category_id', cat.id)

      const typed = (products as unknown as ProductWithScores[]) || []

      const ranked = typed
        .map((p) => {
          const latest = p.scores?.sort(
            (a, b) => new Date(b.calculated_at).getTime() - new Date(a.calculated_at).getTime()
          )[0]
          return { product: p, score: latest?.overall_score ?? null }
        })
        .filter((x) => x.score !== null)
        .sort((a, b) => (b.score || 0) - (a.score || 0))

      return {
        category: cat,
        topProduct: ranked[0]?.product || null,
        topScore: ranked[0]?.score ?? null,
        rankedCount: ranked.length,
      }
    })
  )

  return (
    <main className="min-h-screen px-8 py-16 max-w-5xl mx-auto">
      <header className="mb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-medium mb-4 tracking-tight">Optimal Source</h1>
        <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
          Independent lab testing. Full chain of custody. Real data.
        </p>
        <SearchBar />
      </header>

      <section>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Categories</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enriched.map(({ category, topProduct, topScore, rankedCount }) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="block bg-gray-950 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-medium tracking-tight">{category.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {rankedCount === 0
                      ? 'Not yet tested'
                      : `${rankedCount} ranked ${rankedCount === 1 ? 'product' : 'products'}`}
                  </p>
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">View →</div>
              </div>

              {topProduct && topScore !== null ? (
                <div className="flex items-center gap-4 pt-4 border-t border-gray-900">
                  <div className="w-12 h-12 bg-black border border-gray-900 rounded-lg flex items-center justify-center overflow-hidden">
                    {topProduct.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={topProduct.image_url} alt={topProduct.name} className="w-full h-full object-contain p-1.5" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 uppercase tracking-wider mb-0.5">No. 1</p>
                    <p className="text-sm font-medium truncate">{topProduct.name}</p>
                  </div>
                  <div className="text-2xl font-medium tabular-nums tracking-tight">{topScore}</div>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-900 text-xs text-gray-600">
                  Testing coming soon
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
