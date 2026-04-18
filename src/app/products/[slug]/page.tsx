import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SaveButton } from '@/components/product/SaveButton'
import type { Product, Score, Category } from '@/types/database'
import type { ProductDetailsData } from '@/types/product-details'

type PageProps = {
  params: Promise<{ slug: string }>
}

type ProductWithRelations = Product & {
  categories: Category | null
  scores: Score[]
}

function scoreToGrade(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

function scoreToLabel(score: number): string {
  if (score >= 90) return 'Excellent'
  if (score >= 80) return 'Very good'
  if (score >= 70) return 'Good'
  if (score >= 60) return 'Fair'
  return 'Poor'
}

function scoreToColor(score: number): string {
  if (score >= 80) return 'var(--good)'
  if (score >= 60) return 'var(--warning)'
  return 'var(--bad)'
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params

  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*), scores(*)')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    notFound()
  }

  const p = data as unknown as ProductWithRelations
  const details = (p.aggregated_data || {}) as ProductDetailsData
  const category = p.categories

  const latestScore = p.scores?.sort(
    (a, b) => new Date(b.calculated_at).getTime() - new Date(a.calculated_at).getTime()
  )[0]

  const overall = latestScore?.overall_score ?? null
  const grade = overall !== null ? scoreToGrade(overall) : null
  const label = overall !== null ? scoreToLabel(overall) : null
  const scoreColor = overall !== null ? scoreToColor(overall) : 'var(--text-tertiary)'

  return (
    <main className="min-h-screen px-6 md:px-8 py-8 md:py-12 max-w-3xl mx-auto">

      <nav className="mb-6 md:mb-8 text-sm">
        <Link href="/" className="text-[var(--text-tertiary)] hover:text-[var(--foreground)]">Home</Link>
        <span className="mx-2 text-[var(--text-tertiary)]">/</span>
        {category ? (
          <>
            <Link href={`/categories/${category.slug}`} className="text-[var(--text-tertiary)] hover:text-[var(--foreground)]">
              {category.name}
            </Link>
            <span className="mx-2 text-[var(--text-tertiary)]">/</span>
          </>
        ) : null}
        <span className="text-[var(--foreground)]">{p.name}</span>
      </nav>

      <div className="flex justify-center mb-6">
        <div className="bg-white border border-[var(--border)] rounded-2xl w-[180px] h-[220px] md:w-[240px] md:h-[300px] flex items-center justify-center overflow-hidden p-3">
          {p.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image_url} alt={p.name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-xs text-[var(--text-tertiary)]">No image</span>
          )}
        </div>
      </div>

      <h1 className="font-serif text-3xl md:text-4xl font-medium text-center tracking-tight leading-tight mb-2 text-[var(--foreground)]">
        {p.name}
      </h1>
      <p className="text-sm text-[var(--text-secondary)] text-center mb-8">
        {p.brand ? p.brand : ''}
        {details.subcategory ? <><span className="text-[var(--text-tertiary)] mx-2">·</span>{details.subcategory}</> : null}
      </p>

      {overall !== null && grade ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 md:p-6 mb-5 flex items-center gap-4 md:gap-5">
          <div className="w-16 h-16 md:w-20 md:h-20 border-2 border-[var(--foreground)] rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="font-serif text-4xl md:text-5xl font-medium leading-none text-[var(--foreground)]">{grade}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-serif text-3xl md:text-4xl font-medium leading-none tracking-tight text-[var(--foreground)]">
              {overall}<span className="text-lg md:text-xl text-[var(--text-tertiary)] font-normal">/100</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] mt-2">TrueRank Score</p>
            <p className="text-xs mt-1" style={{ color: scoreColor }}>{label}</p>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 mb-5 text-center">
          <p className="text-sm text-[var(--text-tertiary)]">Not yet scored</p>
        </div>
      )}

      <div className="flex gap-2 mb-10">
        <SaveButton productId={p.id} />
      </div>

      {/* Summary */}
      <section className="border-t border-[var(--border)] pt-6 mb-10">
        <h2 className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] mb-4">Summary</h2>
        <div>
          <SummaryRow label="Lab tested" value={p.is_tested ? 'Yes' : 'No'} positive={p.is_tested} />
          <SummaryRow
            label="Contaminants"
            value={details.harmful_ingredients_count === 0 ? 'None' : `${details.harmful_ingredients_count ?? '—'}`}
            positive={details.harmful_ingredients_count === 0}
          />
          <SummaryRow
            label="Beneficial minerals"
            value={`${details.beneficial_ingredients_count ?? '—'}`}
          />
          <SummaryRow
            label="PFAS"
            value={details.pfas_detected === null || details.pfas_detected === undefined ? 'Not tested' : details.pfas_detected ? 'Detected' : 'None'}
            positive={details.pfas_detected === false}
            muted={details.pfas_detected === null || details.pfas_detected === undefined}
          />
          <SummaryRow
            label="Microplastics"
            value={details.microplastics_detected === null || details.microplastics_detected === undefined ? 'Not tested' : details.microplastics_detected ? 'Detected' : 'None'}
            positive={details.microplastics_detected === false}
            muted={details.microplastics_detected === null || details.microplastics_detected === undefined}
            isLast
          />
        </div>
      </section>

      {/* Why this score */}
      {latestScore?.notes ? (
        <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 md:p-6 mb-10">
          <h2 className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] mb-3">Why this score</h2>
          <p className="font-serif text-base md:text-lg font-medium leading-relaxed text-[var(--foreground)]">
            {latestScore.notes}
          </p>
        </section>
      ) : null}

      {/* Minerals */}
      {details.minerals && details.minerals.length > 0 ? (
        <section className="mb-10">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">Minerals</h2>
            <span className="text-xs text-[var(--text-secondary)]">
              {details.minerals.length} beneficial
            </span>
          </div>
          <div>
            {details.minerals.map((mineral, i) => (
              <div
                key={i}
                className={`py-4 border-t border-[var(--border)] ${
                  i === details.minerals!.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-medium text-[var(--foreground)]">{mineral.name}</span>
                  <span className="text-sm font-medium tabular-nums" style={{ color: 'var(--good)' }}>{mineral.amount}</span>
                </div>
                {mineral.description ? (
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{mineral.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Contaminants */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)]">Contaminants</h2>
          {!details.contaminants || details.contaminants.length === 0 ? (
            <span className="text-xs font-medium" style={{ color: 'var(--good)' }}>None detected</span>
          ) : (
            <span className="text-xs font-medium" style={{ color: 'var(--bad)' }}>
              {details.contaminants.length} detected
            </span>
          )}
        </div>
        {!details.contaminants || details.contaminants.length === 0 ? (
          <div className="py-5 border-t border-b border-[var(--border)]">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              No contaminants detected in published lab results.
            </p>
          </div>
        ) : (
          <div>
            {details.contaminants.map((c, i) => (
              <div
                key={i}
                className={`py-4 border-t border-[var(--border)] ${
                  i === details.contaminants!.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-sm font-medium text-[var(--foreground)]">{c.name}</span>
                  <span className="text-sm font-medium tabular-nums" style={{ color: 'var(--bad)' }}>{c.amount}</span>
                </div>
                {c.description ? (
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{c.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Product details */}
      {details.details && details.details.length > 0 ? (
        <section className="mb-10">
          <h2 className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] mb-4">Product details</h2>
          <div>
            {details.details.map((d, i) => (
              <div
                key={i}
                className={`flex justify-between py-3 border-t border-[var(--border)] text-sm ${
                  i === details.details!.length - 1 ? 'border-b' : ''
                }`}
              >
                <span className="text-[var(--text-secondary)]">{d.label}</span>
                <span className="text-[var(--foreground)] text-right">{d.value}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Sources */}
      {details.sources && details.sources.length > 0 ? (
        <section className="mb-10">
          <h2 className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] mb-4">Sources</h2>
          <div>
            {details.sources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex justify-between items-center py-3 border-t border-[var(--border)] text-sm hover:bg-[var(--surface-hover)] transition-colors ${
                  i === details.sources!.length - 1 ? 'border-b' : ''
                }`}
              >
                <span className="text-[var(--foreground)]">{s.label}</span>
                <span className="text-[var(--text-tertiary)]">→</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}

function SummaryRow({
  label,
  value,
  positive,
  muted,
  isLast,
}: {
  label: string
  value: string
  positive?: boolean
  muted?: boolean
  isLast?: boolean
}) {
  return (
    <div className={`flex justify-between items-center py-3.5 ${isLast ? '' : 'border-b'} border-[var(--border)]`}>
      <span className="text-sm text-[var(--foreground)]">{label}</span>
      <span
        className={`text-sm ${positive ? 'font-medium' : muted ? '' : 'font-medium'}`}
        style={{
          color: muted
            ? 'var(--text-tertiary)'
            : positive
              ? 'var(--good)'
              : 'var(--foreground)',
        }}
      >
        {value}
      </span>
    </div>
  )
}
