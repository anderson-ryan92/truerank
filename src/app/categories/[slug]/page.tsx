import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Category, Product, Score } from '@/types/database'
import type { ProductDetailsData } from '@/types/product-details'

type PageProps = {
  params: Promise<{ slug: string }>
}

type ProductWithScores = Product & { scores: Score[] }

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

  const cat = category as Category

  const { data: rawProducts } = await supabase
    .from('products')
    .select('*, scores(overall_score, contaminants_score, potency_score, transparency_score, certifications_score, calculated_at)')
    .eq('category_id', cat.id)

  const products = (rawProducts as unknown as ProductWithScores[]) || []

  const withLatestScore = products.map((p) => {
    const latest = p.scores?.sort(
      (a, b) => new Date(b.calculated_at).getTime() - new Date(a.calculated_at).getTime()
    )[0] || null
    return { product: p, latestScore: latest }
  })

  const ranked = withLatestScore
    .filter((x) => x.latestScore?.overall_score !== null && x.latestScore?.overall_score !== undefined)
    .sort((a, b) => (b.latestScore!.overall_score || 0) - (a.latestScore!.overall_score || 0))

  const unranked = withLatestScore
    .filter((x) => x.latestScore?.overall_score === null || x.latestScore?.overall_score === undefined)

  const hero = ranked[0] || null
  const restRanked = ranked.slice(1)

  return (
    <main className="min-h-screen px-8 py-16 max-w-4xl mx-auto">
      <nav className="mb-8 text-sm">
        <Link href="/" className="text-gray-500 hover:text-gray-300">
          ← All categories
        </Link>
      </nav>

      <header className="mb-10">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Category</p>
        <h1 className="text-5xl font-medium mb-3 tracking-tight">{cat.name}</h1>
        {cat.description ? (
          <p className="text-lg text-gray-400 max-w-2xl">{cat.description}</p>
        ) : null}
      </header>

      {ranked.length > 0 ? (
        <section className="mb-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Highest ranked
            </h2>
            <span className="text-xs text-gray-600">
              {ranked.length} {ranked.length === 1 ? 'product' : 'products'} tested
            </span>
          </div>

          {hero ? <HeroCard product={hero.product} score={hero.latestScore!} /> : null}

          {restRanked.length > 0 ? (
            <div className="flex flex-col">
              {restRanked.map((item, index) => (
                <RankRow
                  key={item.product.id}
                  product={item.product}
                  score={item.latestScore!}
                  rank={index + 2}
                />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {unranked.length > 0 ? (
        <section>
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Not yet tested
            </h2>
            <span className="text-xs text-gray-600">
              {unranked.length} {unranked.length === 1 ? 'product' : 'products'}
            </span>
          </div>

          <div className="flex flex-col">
            {unranked.map((item) => (
              <UnrankedRow key={item.product.id} product={item.product} />
            ))}
          </div>
        </section>
      ) : null}

      {ranked.length === 0 && unranked.length === 0 ? (
        <div className="p-12 border border-dashed border-gray-800 rounded-2xl text-center">
          <p className="text-gray-400 mb-2">No products in {cat.name.toLowerCase()} yet.</p>
          <p className="text-sm text-gray-500">Check back soon.</p>
        </div>
      ) : null}
    </main>
  )
}

function HeroCard({ product, score }: { product: Product; score: Score }) {
  const details = (product.aggregated_data || {}) as ProductDetailsData

  return (
    <Link
      href={`/products/${product.slug}`}
      className="block bg-gray-950 border border-gray-800 rounded-2xl p-8 mb-8 hover:border-gray-700 transition-colors"
    >
      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-8 items-center">
        <div className="aspect-square bg-black border border-gray-900 rounded-xl flex items-center justify-center overflow-hidden">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-6" />
          ) : (
            <span className="text-xs text-gray-700">No image</span>
          )}
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">No. 1</p>
          <h3 className="text-3xl font-medium mb-1 tracking-tight">{product.name}</h3>
          <p className="text-sm text-gray-400 mb-5">
            {product.brand ? `${product.brand}` : ''}
            {details.subcategory ? ` · ${details.subcategory}` : ''}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <AxisStat label="Contaminants" value={score.contaminants_score} />
            <AxisStat label="Potency" value={score.potency_score} />
            <AxisStat label="Transparency" value={score.transparency_score} />
            <AxisStat label="Certifications" value={score.certifications_score} />
          </div>
        </div>

        <div className="text-center">
          <div className="text-6xl font-medium tracking-tight leading-none tabular-nums">
            {score.overall_score}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-2">Overall</div>
        </div>
      </div>
    </Link>
  )
}

function AxisStat({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-medium tabular-nums">{value !== null ? value : '—'}</p>
    </div>
  )
}

function RankRow({
  product,
  score,
  rank,
}: {
  product: Product
  score: Score
  rank: number
}) {
  const details = (product.aggregated_data || {}) as ProductDetailsData

  return (
    <Link
      href={`/products/${product.slug}`}
      className="grid grid-cols-[32px_56px_1fr_auto] gap-4 items-center py-5 border-t border-gray-900 last:border-b hover:bg-gray-950/40 transition-colors px-2 -mx-2 rounded-lg"
    >
      <div className="text-sm text-gray-600 tabular-nums">
        {rank.toString().padStart(2, '0')}
      </div>
      <div className="w-14 h-14 bg-gray-950 border border-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-2" />
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="font-medium truncate">{product.name}</p>
        <p className="text-sm text-gray-500 truncate">
          {product.brand ? `${product.brand}` : ''}
          {details.subcategory ? ` · ${details.subcategory}` : ''}
        </p>
      </div>
      <div className="text-2xl font-medium tabular-nums tracking-tight">
        {score.overall_score}
      </div>
    </Link>
  )
}

function UnrankedRow({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="grid grid-cols-[56px_1fr_auto] gap-4 items-center py-4 border-t border-gray-900 last:border-b hover:bg-gray-950/40 transition-colors px-2 -mx-2 rounded-lg"
    >
      <div className="w-14 h-14 bg-gray-950 border border-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-2" />
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="font-medium truncate">{product.name}</p>
        {product.brand ? <p className="text-sm text-gray-500 truncate">{product.brand}</p> : null}
      </div>
      <div className="text-xs text-gray-600 uppercase tracking-wider">Untested</div>
    </Link>
  )
}
