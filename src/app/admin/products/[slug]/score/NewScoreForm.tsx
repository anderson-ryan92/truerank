'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { Score } from '@/types/database'

type Props = {
  productId: string
  productSlug: string
  existing: Score | null
}

const METHODOLOGY_VERSION = 'v1.0'

export function NewScoreForm({ productId, productSlug, existing }: Props) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [contaminants, setContaminants] = useState(existing?.contaminants_score?.toString() || '')
  const [potency, setPotency] = useState(existing?.potency_score?.toString() || '')
  const [transparency, setTransparency] = useState(existing?.transparency_score?.toString() || '')
  const [certifications, setCertifications] = useState(existing?.certifications_score?.toString() || '')
  const [notes, setNotes] = useState(existing?.notes || '')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  function parseScore(v: string): number | null {
    if (!v.trim()) return null
    const n = parseInt(v, 10)
    if (isNaN(n) || n < 0 || n > 100) return null
    return n
  }

  function average(values: (number | null)[]): number | null {
    const valid = values.filter((v): v is number => v !== null)
    if (valid.length === 0) return null
    return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const contaminantsVal = parseScore(contaminants)
    const potencyVal = parseScore(potency)
    const transparencyVal = parseScore(transparency)
    const certificationsVal = parseScore(certifications)

    const overall = average([contaminantsVal, potencyVal, transparencyVal, certificationsVal])

    const { error } = await supabase.from('scores').insert({
      product_id: productId,
      contaminants_score: contaminantsVal,
      potency_score: potencyVal,
      transparency_score: transparencyVal,
      certifications_score: certificationsVal,
      overall_score: overall,
      methodology_version: METHODOLOGY_VERSION,
      notes: notes.trim() || null,
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setIsLoading(false)
      return
    }

    router.refresh()
    router.push(`/products/${productSlug}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {existing ? (
        <div className="p-3 rounded-lg bg-[var(--warning-bg)] border border-[var(--warning)] text-[var(--warning)] text-sm">
          A score already exists. Submitting creates a new version; the old one is preserved.
        </div>
      ) : null}

      <ScoreField
        label="Contaminants"
        hint="How clean is it? Non-detect across full panel = 100"
        value={contaminants}
        onChange={setContaminants}
      />
      <ScoreField
        label="Potency"
        hint="Does the product match its label claims? Exact match = 100"
        value={potency}
        onChange={setPotency}
      />
      <ScoreField
        label="Transparency"
        hint="COAs, batch testing, sourcing disclosure"
        value={transparency}
        onChange={setTransparency}
      />
      <ScoreField
        label="Certifications"
        hint="Third-party certs with real auditing"
        value={certifications}
        onChange={setCertifications}
      />

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Why these scores? What was tested, what wasn't, any caveats..."
          rows={4}
          className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-gray-600"
        />
      </div>

      <div className="p-4 border border-[var(--border)] rounded-lg text-sm text-[var(--text-tertiary)]">
        Methodology version: <span className="text-[var(--foreground)]">{METHODOLOGY_VERSION}</span>
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
          disabled={isLoading}
          className="px-6 py-3 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full font-semibold hover:opacity-90 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save scores'}
        </button>
        <Link href="/admin" className="px-6 py-3 text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors">
          Cancel
        </Link>
      </div>
    </form>
  )
}

function ScoreField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
        {label} <span className="text-xs text-[var(--text-tertiary)]">(0-100)</span>
      </label>
      <input
        type="number"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Leave blank if not applicable"
        className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-gray-600"
      />
      <p className="text-xs text-[var(--text-tertiary)] mt-1">{hint}</p>
    </div>
  )
}
