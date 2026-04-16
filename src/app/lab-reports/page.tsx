import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { LabReport, Product } from '@/types/database'

type LabReportWithProduct = LabReport & {
  products: Pick<Product, 'id' | 'name' | 'slug' | 'brand'> | null
}

export default async function LabReportsPage() {
  const { data: labReports, error } = await supabase
    .from('lab_reports')
    .select('*, products(id, name, slug, brand)')
    .order('test_date', { ascending: false })

  const reports = (labReports as LabReportWithProduct[]) || []

  return (
    <main className="min-h-screen px-8 py-16 max-w-4xl mx-auto">
      <header className="mb-12">
        <h1 className="text-5xl font-bold mb-4">Lab Reports</h1>
        <p className="text-xl text-[var(--text-secondary)]">
          Every test we have commissioned. Full documentation, downloadable reports.
        </p>
      </header>

      <section className="mb-8 p-6 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <Stat label="Total reports" value={reports.length} />
          <Stat label="Independent tests" value={reports.filter((r) => r.is_independent).length} />
          <Stat label="With video" value={reports.filter((r) => r.video_url).length} />
          <Stat label="With chain of custody" value={reports.filter((r) => r.chain_of_custody_url).length} />
        </div>
      </section>

      {error ? (
        <div className="mb-6 p-4 border border-[var(--bad)] bg-[var(--bad-bg)] rounded-lg">
          <p className="text-sm text-[var(--bad)]">Error loading reports: {error.message}</p>
        </div>
      ) : null}

      {reports.length === 0 ? (
        <div className="p-12 border border-dashed border-[var(--border-strong)] rounded-lg text-center">
          <p className="text-[var(--text-secondary)] mb-2 text-lg">No lab reports published yet.</p>
          <p className="text-sm text-[var(--text-tertiary)]">First round of testing in progress. Results coming soon.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </main>
  )
}

function ReportCard({ report }: { report: LabReportWithProduct }) {
  return (
    <div className="p-6 border border-[var(--border)] rounded-lg hover:border-gray-600 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          {report.products ? (
            <Link href={`/products/${report.products.slug}`} className="text-lg font-semibold hover:underline">
              {report.products.name}
            </Link>
          ) : null}
          {report.products?.brand ? (
            <p className="text-sm text-[var(--text-tertiary)]">{report.products.brand}</p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-sm text-[var(--text-secondary)]">
            {new Date(report.test_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          {report.is_independent ? (
            <span className="inline-block mt-1 text-xs px-2 py-0.5 border border-[var(--good)] text-[var(--good)] rounded">
              Independent
            </span>
          ) : null}
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm text-[var(--text-secondary)]">
          <span className="text-[var(--text-tertiary)]">Lab:</span> {report.lab_name}
          {report.lab_location ? <span className="text-[var(--text-tertiary)]"> · {report.lab_location}</span> : null}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        {report.report_pdf_url ? (
          <a href={report.report_pdf_url} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
            Lab report PDF
          </a>
        ) : null}
        {report.chain_of_custody_url ? (
          <a href={report.chain_of_custody_url} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
            Chain of custody
          </a>
        ) : null}
        {report.video_url ? (
          <a href={report.video_url} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
            Testing video
          </a>
        ) : null}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs text-[var(--text-tertiary)] mt-1">{label}</p>
    </div>
  )
}
