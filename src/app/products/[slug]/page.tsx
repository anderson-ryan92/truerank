import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { SaveButton } from '@/components/product/SaveButton'
import type { Category, Product, LabReport, Score } from '@/types/database'
import type { ProductDetailsData } from '@/types/product-details'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!product) {
    notFound()
  }

  const p = product as Product
  const details = (p.aggregated_data || {}) as ProductDetailsData

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', p.category_id)
    .single()

  const { data: labReports } = await supabase
    .from('lab_reports')
    .select('*')
    .eq('product_id', p.id)
    .order('test_date', { ascending: false })

  const { data: scores } = await supabase
    .from('scores')
    .select('*')
    .eq('product_id', p.id)
    .order('calculated_at', { ascending: false })
    .limit(1)

  const cat = category as Category | null
  const reports = (labReports as LabReport[]) || []
  const score = (scores as Score[])?.[0] || null

  return (
    <main className="min-h-screen px-8 py-12 max-w-5xl mx-auto">
      <nav className="mb-8 text-sm text-gray-500">
        <Link href="/" className="hover:text-[var(--foreground)]">Home</Link>
        {cat ? (
          <>
            <span className="mx-2">/</span>
            <Link href={`/categories/${cat.slug}`} className="hover:text-[var(--foreground)]">
              {cat.name}
            </Link>
          </>
        ) : null}
        <span className="mx-2">/</span>
        <span className="text-[var(--foreground)]">{p.name}</span>
      </nav>

      {/* HERO: Image + Details + Overall Score */}
      <section className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-8 mb-12">
        <div className="aspect-square bg-[var(--background)] border border-[var(--border)] rounded-xl flex items-center justify-center overflow-hidden">
          {p.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.image_url} alt={p.name} className="w-full h-full object-contain p-8" />
          ) : (
            <div className="text-gray-700 text-sm">No image</div>
          )}
        </div>

        <div className="flex flex-col">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2 leading-tight">{p.name}</h1>
            {p.brand ? <p className="text-lg text-[var(--text-secondary)] mb-3">{p.brand}</p> : null}

            {details.subcategory ? (
              <div className="inline-block px-3 py-1 mb-4 text-xs border border-gray-700 rounded-full text-[var(--foreground)]">
                {details.subcategory}
              </div>
            ) : null}

            {/* Overall score + save */}
            <div className="flex items-center gap-4 mb-6">
              {score?.overall_score !== null && score?.overall_score !== undefined ? (
                <ScoreCircle value={score.overall_score} />
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-800 rounded-lg text-sm text-gray-500">
                  Not yet scored
                </div>
              )}
              <SaveButton productId={p.id} />
            </div>

            {/* Summary stats row */}
            <div className="space-y-3">
              <SummaryRow
                label="Lab tested"
                value={p.is_tested ? 'Yes' : 'No'}
                status={p.is_tested ? 'good' : 'neutral'}
              />
              {details.harmful_ingredients_count !== null && details.harmful_ingredients_count !== undefined ? (
                <SummaryRow
                  label="Harmful ingredients"
                  value={details.harmful_ingredients_count.toString()}
                  status={details.harmful_ingredients_count === 0 ? 'good' : 'bad'}
                />
              ) : null}
              {details.beneficial_ingredients_count !== null && details.beneficial_ingredients_count !== undefined ? (
                <SummaryRow
                  label="Beneficial ingredients"
                  value={details.beneficial_ingredients_count.toString()}
                  status="good"
                />
              ) : null}
              {details.microplastics_detected !== null && details.microplastics_detected !== undefined ? (
                <SummaryRow
                  label="Microplastics"
                  value={details.microplastics_detected ? 'Detected' : 'None detected'}
                  status={details.microplastics_detected ? 'bad' : 'good'}
                />
              ) : null}
              {details.pfas_detected !== null && details.pfas_detected !== undefined ? (
                <SummaryRow
                  label="PFAS"
                  value={details.pfas_detected ? 'Detected' : 'None detected'}
                  status={details.pfas_detected ? 'bad' : 'good'}
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* SCORE BREAKDOWN */}
      {score ? (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Score Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ScoreCard label="Contaminants" value={score.contaminants_score} />
            <ScoreCard label="Potency" value={score.potency_score} />
            <ScoreCard label="Transparency" value={score.transparency_score} />
            <ScoreCard label="Certifications" value={score.certifications_score} />
          </div>
        </section>
      ) : null}

      {/* CONTAMINANTS */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Contaminants</h2>
        {!details.contaminants || details.contaminants.length === 0 ? (
          <div className="p-6 border border-green-900 bg-green-950 rounded-lg text-green-400">
            No contaminants identified in the latest lab tests.
          </div>
        ) : (
          <div className="space-y-3">
            {details.contaminants.map((c, i) => (
              <div
                key={i}
                className={`p-5 border rounded-lg ${
                  c.severity === 'high'
                    ? 'border-red-900 bg-red-950/30'
                    : c.severity === 'moderate'
                    ? 'border-yellow-900 bg-yellow-950/20'
                    : 'border-gray-800'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{c.name}</h3>
                  <span className="text-sm text-[var(--text-secondary)]">{c.amount}</span>
                </div>
                {c.description ? <p className="text-sm text-[var(--text-secondary)]">{c.description}</p> : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MINERALS */}
      {details.minerals && details.minerals.length > 0 ? (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Ingredients & Minerals</h2>
          <div className="space-y-3">
            {details.minerals.map((m, i) => (
              <div key={i} className="p-5 border border-gray-800 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{m.name}</h3>
                  <span className="text-sm text-[var(--text-secondary)]">{m.amount}</span>
                </div>
                {m.description ? <p className="text-sm text-[var(--text-secondary)]">{m.description}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* PRODUCT DETAILS */}
      {details.details && details.details.length > 0 ? (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {details.details.map((d, i) => (
              <div key={i} className="p-5 border border-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{d.label}</p>
                <p className="text-lg font-semibold">{d.value}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* LAB REPORTS */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Lab Reports</h2>
        {reports.length === 0 ? (
          <div className="p-8 border border-dashed border-gray-700 rounded-lg text-center text-gray-500">
            No lab reports available yet.
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="p-6 border border-gray-800 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{report.lab_name}</h3>
                    {report.lab_location ? (
                      <p className="text-sm text-gray-500">{report.lab_location}</p>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-[var(--text-secondary)]">
                      {new Date(report.test_date).toLocaleDateString()}
                    </span>
                    {report.is_independent ? (
                      <p className="inline-block mt-1 text-xs px-2 py-0.5 border border-green-800 text-green-400 rounded">
                        Independent
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm mt-3">
                  {report.report_pdf_url ? (
                    <a href={report.report_pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      Lab report PDF
                    </a>
                  ) : null}
                  {report.chain_of_custody_url ? (
                    <a href={report.chain_of_custody_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      Chain of custody
                    </a>
                  ) : null}
                  {report.video_url ? (
                    <a href={report.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      Testing video
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SOURCES */}
      {details.sources && details.sources.length > 0 ? (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Sources</h2>
          <ul className="space-y-2">
            {details.sources.map((s, i) => (
              <li key={i}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  )
}

function ScoreCircle({ value }: { value: number }) {
  const color = value >= 80 ? 'border-green-500 text-green-400' : value >= 60 ? 'border-yellow-500 text-yellow-400' : 'border-red-500 text-red-400'
  return (
    <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 ${color}`}>
      <span className="text-3xl font-bold leading-none">{value}</span>
      <span className="text-[10px] text-gray-500 uppercase tracking-wide mt-1">/ 100</span>
    </div>
  )
}

function ScoreCard({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="p-4 border border-gray-800 rounded-lg">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold">
        {value !== null ? value : '—'}
        {value !== null ? <span className="text-lg text-gray-600">/100</span> : null}
      </p>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  status,
}: {
  label: string
  value: string
  status: 'good' | 'bad' | 'neutral'
}) {
  const dotColor = status === 'good' ? 'bg-green-500' : status === 'bad' ? 'bg-red-500' : 'bg-gray-600'
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-900 last:border-b-0">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm">{value}</span>
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
      </div>
    </div>
  )
}
