import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Category, Product, Score } from '@/types/database'

type PageProps = {
  searchParams: Promise<{ category?: string }>
}

type ProductWithCategoryAndScore = Product & {
  categories: Pick<Category, 'name' | 'slug'> | null
  scores: Score[]
}

export default async function HighestRankedPage({ searchParams }: PageProps) {
  const { category: selectedSlug } = await searchParams

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  const categoryList = (categories as Category[]) || []

  let selectedCategoryId: string | null = null
  if (selectedSlug) {
    const match = categoryList.find((c) => c.slug === selectedSlug)
    if (match) selectedCategoryId = match.id
  }

  let query = supabase
  .from('products')
  .select('*, categories(name, slug), scores(overall_score, contaminants_score, potency_score, transparency_score, certifications_score, calculated_at)')
  .limit(50)

  if (selectedCategoryId) {
    query = query.eq('category_id', selectedCategoryId)
  }

  const { data: rawProducts } = await query
  const products = (rawProducts as unknown as ProductWithCategoryAndScore[]) || []

  const ranked = products
    .map((p) => ({
      ...p,
      latestScore: p.scores?.sort((a, b) =>
        new Date(b.calculated_at).getTime() - new Date(a.calculated_at).getTime()
      )[0] || null,
    }))
    .filter((p) => p.latestScore?.overall_score !== null && p.latestScore?.overall_score !== undefined)
    .sort((a, b) => (b.latestScore?.overall_score || 0) - (a.latestScore?.overall_score || 0))

  return (
    <main className="min-h-screen px-8 py-16 max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-5xl font-bold mb-4">Highest Ranked</h1>
        <p className="text-xl text-gray-400">
          Independently tested. Ranked by verified lab data, not marketing.
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/highest-ranked"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !selectedSlug
              ? 'bg-white text-black'
              : 'bg-transparent border border-gray-700 text-gray-400 hover:border-white hover:text-white'
          }`}
        >
          All categories
        </Link>
        {categoryList.map((cat) => (
          <Link
            key={cat.id}
            href={`/highest-ranked?category=${cat.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedSlug === cat.slug
                ? 'bg-white text-black'
                : 'bg-transparent border border-gray-700 text-gray-400 hover:border-white hover:text-white'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {ranked.length === 0 ? (
        <div className="p-12 border border-dashed border-gray-700 rounded-lg text-center">
          <p className="text-gray-400 mb-2 text-lg">No ranked products yet.</p>
          <p className="text-sm text-gray-500">
            Products appear here after independent lab testing and scoring.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {ranked.map((product, index) => {
            const score = product.latestScore!
            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="flex items-center gap-4 p-5 border border-gray-800 rounded-lg hover:border-gray-600 transition-colors"
              >
                <div className="w-10 text-center text-2xl font-bold text-gray-600">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{product.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {product.brand ? <span>{product.brand}</span> : null}
                    {product.brand && product.categories ? <span>·</span> : null}
                    {product.categories ? <span>{product.categories.name}</span> : null}
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <ScoreBadge label="Cont" value={score.contaminants_score} />
                  <ScoreBadge label="Pot" value={score.potency_score} />
                  <ScoreBadge label="Trans" value={score.transparency_score} />
                  <ScoreBadge label="Cert" value={score.certifications_score} />
                </div>
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 border-white">
                  <span className="text-2xl font-bold leading-none">{score.overall_score}</span>
                  <span className="text-[9px] text-gray-500 uppercase tracking-wide mt-0.5">Overall</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}

function ScoreBadge({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="text-center hidden md:block">
      <p className="text-xs text-gray-600 uppercase">{label}</p>
      <p className="font-semibold">{value !== null ? value : '—'}</p>
    </div>
  )
}
