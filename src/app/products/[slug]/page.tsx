import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Category, Product, LabReport, Score } from '@/types/database'

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

  const productTyped = product as Product

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', productTyped.category_id)
    .single()

  const { data: labReports } = await supabase
    .from('lab_reports')
    .select('*')
    .eq('product_id', productTyped.id)
    .order('test_date', { ascending: false })

  const { data: scores } = await supabase
    .from('scores')
    .select('*')
    .eq('product_id', productTyped.id)
    .order('calculated_at', { ascending: false })
    .limit(1)

  const categoryTyped = category as Category | null
  const labReportList = (labReports as LabReport[]) || []
  const latestScore = (scores as Score[])?.[0] || null

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <nav className="mb-8 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-300">Home</Link>
        {categoryTyped && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/categories/${categoryTyped.slug}`} className="hover:text-gray-300">
              {categoryTyped.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-300">{productTyped.name}</span>
      </nav>

      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2">{productTyped.name}</h1>
        {productTyped.brand && (
          <p className="text-xl text-gray-500">{productTyped.brand}</p>
        )}
        {productTyped.purchase_location && (
          <p className="text-sm text-gray-600 mt-2">
            Purchased at: {productTyped.purchase_location}
            {productTyped.purchase_price_cents && (
              <> · ${(productTyped.purchase_price_cents / 100).toFixed(2)}</>
            )}
          </p>
        )}
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Score Breakdown</h2>
        {latestScore ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ScoreCard label="Contaminants" value={latestScore.contaminants_score} />
            <ScoreCard label="Potency" value={latestScore.potency_score} />
            <ScoreCard label="Transparency" value={latestScore.transparency_score} />
            <ScoreCard label="Certifications" value={latestScore.certifications_score} />
          </div>
        ) : (
          <div className="p-8 border border-dashed border-gray-700 rounded-lg text-center">
            <p className="text-gray-500 mb-1">Not yet scored</p>
            <p className="text-sm text-gray-600">
              {productTyped.is_tested
                ? 'Scoring in progress. Results coming soon.'
                : 'This product has not been independently tested yet.'}
            </p>
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Lab Reports</h2>
        {labReportList.length > 0 ? (
          <div className="space-y-4">
            {labReportList.map((report) => (
              <div key={report.id} className="p-6 border border-gray-700 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{report.lab_name}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(report.test_date).toLocaleDateString()}
                  </span>
                </div>
                {report.lab_location && (
                  <p className="text-sm text-gray-500 mb-3">{report.lab_location}</p>
                )}
                <div className="flex gap-4 text-sm">
                  {report.report_pdf_url && (
                    <a href={report.report_pdf_url} className="text-blue-400 hover:underline">
                      Download lab report (PDF)
                    </a>
                  )}
                  {report.chain_of_custody_url && (
                    <a href={report.chain_of_custody_url} className="text-blue-400 hover:underline">
                      Chain of custody
                    </a>
                  )}
                  {report.video_url && (
                    <a href={report.video_url} className="text-blue-400 hover:underline">
                      Watch testing video
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-gray-700 rounded-lg text-center">
            <p className="text-gray-500">No lab reports available yet.</p>
          </div>
        )}
      </section>
    </main>
  )
}

function ScoreCard({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="p-4 border border-gray-700 rounded-lg">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold">
        {value !== null ? value : '—'}
        {value !== null && <span className="text-lg text-gray-500">/100</span>}
      </p>
    </div>
  )
}
