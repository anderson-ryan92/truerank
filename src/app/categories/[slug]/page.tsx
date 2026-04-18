import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CategoryProductList } from '@/components/CategoryProductList'
import type { Category, Product, Score } from '@/types/database'

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
    .map((x) => ({ product: x.product, latestScore: x.latestScore! }))

  const unranked = withLatestScore
    .filter((x) => x.latestScore?.overall_score === null || x.latestScore?.overall_score === undefined)
    .map((x) => ({ product: x.product }))

  return (
    <main className="min-h-screen px-8 py-16 max-w-4xl mx-auto">
      <nav className="mb-8 text-sm">
        <Link href="/" className="text-[var(--text-tertiary)] hover:text-[var(--foreground)]">
          ← All categories
        </Link>
      </nav>

      <header className="mb-12">
        <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Category</p>
        <h1 className="font-serif text-6xl font-medium mb-3 tracking-tight text-[var(--foreground)]">
          {cat.name}
        </h1>
        {cat.description ? (
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl">{cat.description}</p>
        ) : null}
      </header>

      <CategoryProductList
        ranked={ranked}
        unranked={unranked}
        categoryName={cat.name}
      />
    </main>
  )
}
