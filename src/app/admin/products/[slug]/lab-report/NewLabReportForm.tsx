'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

type Props = {
  productId: string
  productSlug: string
}

export function NewLabReportForm({ productId, productSlug }: Props) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [labName, setLabName] = useState('')
  const [labLocation, setLabLocation] = useState('')
  const [testDate, setTestDate] = useState(new Date().toISOString().slice(0, 10))
  const [reportPdfUrl, setReportPdfUrl] = useState('')
  const [chainOfCustodyUrl, setChainOfCustodyUrl] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [methodology, setMethodology] = useState('')
  const [isIndependent, setIsIndependent] = useState(true)
  const [markAsTested, setMarkAsTested] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const { error: insertError } = await supabase.from('lab_reports').insert({
      product_id: productId,
      lab_name: labName.trim(),
      lab_location: labLocation.trim() || null,
      test_date: testDate,
      report_pdf_url: reportPdfUrl.trim() || null,
      chain_of_custody_url: chainOfCustodyUrl.trim() || null,
      video_url: videoUrl.trim() || null,
      methodology: methodology.trim() || null,
      is_independent: isIndependent,
    })

    if (insertError) {
      setMessage({ type: 'error', text: insertError.message })
      setIsLoading(false)
      return
    }

    if (markAsTested) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ is_tested: true, updated_at: new Date().toISOString() })
        .eq('id', productId)

      if (updateError) {
        setMessage({ type: 'error', text: `Report saved but failed to mark as tested: ${updateError.message}` })
        setIsLoading(false)
        return
      }
    }

    router.refresh()
    router.push(`/products/${productSlug}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field
        label="Lab name"
        required
        value={labName}
        onChange={setLabName}
        placeholder="Light Labs"
      />
      <Field
        label="Lab location"
        value={labLocation}
        onChange={setLabLocation}
        placeholder="Austin, TX"
      />

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Test date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          required
          value={testDate}
          onChange={(e) => setTestDate(e.target.value)}
          className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-gray-600"
        />
      </div>

      <Field
        label="Lab report PDF URL"
        value={reportPdfUrl}
        onChange={setReportPdfUrl}
        placeholder="https://..."
      />
      <Field
        label="Chain of custody URL"
        value={chainOfCustodyUrl}
        onChange={setChainOfCustodyUrl}
        placeholder="https://..."
      />
      <Field
        label="Video URL"
        value={videoUrl}
        onChange={setVideoUrl}
        placeholder="https://youtube.com/..."
      />

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Methodology notes</label>
        <textarea
          value={methodology}
          onChange={(e) => setMethodology(e.target.value)}
          placeholder="ICP-MS heavy metals panel, EPA 537.1 PFAS, microplastics count..."
          rows={3}
          className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-gray-600"
        />
      </div>

      <div className="space-y-2 pt-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isIndependent}
            onChange={(e) => setIsIndependent(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-[var(--foreground)]">Independently commissioned by TrueRank</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={markAsTested}
            onChange={(e) => setMarkAsTested(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm text-[var(--foreground)]">Mark product as tested</span>
        </label>
      </div>

      {message ? (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'error'
              ? 'bg-[var(--bad-bg)] border border-[var(--bad)] text-[var(--bad)]'
              : 'bg-[var(--good-bg)] border border-[var(--good)] text-[var(--good)]'
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading || !labName.trim()}
          className="px-6 py-3 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full font-semibold hover:opacity-90 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save lab report'}
        </button>
        <Link href="/admin" className="px-6 py-3 text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-gray-600"
      />
    </div>
  )
}
