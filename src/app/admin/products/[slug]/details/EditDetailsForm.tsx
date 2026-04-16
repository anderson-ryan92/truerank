'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import type {
  ProductDetailsData,
  ProductContaminant,
  ProductMineral,
  ProductDetail,
  ProductSource,
} from '@/types/product-details'

type Props = {
  productId: string
  productSlug: string
  existing: ProductDetailsData
  existingImageUrl: string | null
}

export function EditDetailsForm({ productId, productSlug, existing, existingImageUrl }: Props) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [subcategory, setSubcategory] = useState(existing.subcategory || '')
  const [imageUrl, setImageUrl] = useState(existingImageUrl || '')
  const [harmfulCount, setHarmfulCount] = useState(existing.harmful_ingredients_count?.toString() || '')
  const [beneficialCount, setBeneficialCount] = useState(existing.beneficial_ingredients_count?.toString() || '')
  const [microplastics, setMicroplastics] = useState<string>(
    existing.microplastics_detected === true ? 'yes' : existing.microplastics_detected === false ? 'no' : ''
  )
  const [pfas, setPfas] = useState<string>(
    existing.pfas_detected === true ? 'yes' : existing.pfas_detected === false ? 'no' : ''
  )

  const [contaminants, setContaminants] = useState<ProductContaminant[]>(existing.contaminants || [])
  const [minerals, setMinerals] = useState<ProductMineral[]>(existing.minerals || [])
  const [details, setDetails] = useState<ProductDetail[]>(existing.details || [])
  const [sources, setSources] = useState<ProductSource[]>(existing.sources || [])

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const data: ProductDetailsData = {
      ...existing,
      subcategory: subcategory.trim() || undefined,
      harmful_ingredients_count: harmfulCount ? parseInt(harmfulCount, 10) : null,
      beneficial_ingredients_count: beneficialCount ? parseInt(beneficialCount, 10) : null,
      microplastics_detected: microplastics === 'yes' ? true : microplastics === 'no' ? false : null,
      pfas_detected: pfas === 'yes' ? true : pfas === 'no' ? false : null,
      contaminants: contaminants.filter((c) => c.name.trim()),
      minerals: minerals.filter((m) => m.name.trim()),
      details: details.filter((d) => d.label.trim() && d.value.trim()),
      sources: sources.filter((s) => s.label.trim() && s.url.trim()),
    }

    const { error } = await supabase
      .from('products')
      .update({
        aggregated_data: data,
        image_url: imageUrl.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setIsLoading(false)
      return
    }

    router.refresh()
    router.push(`/products/${productSlug}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* SECTION 1: Summary */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Summary</h2>
        
        <Field
          label="Image URL"
          value={imageUrl}
          onChange={setImageUrl}
          placeholder="https://..."
          hint="Paste a direct URL to the product image. Will be added as file upload later."
        />

        <Field
          label="Subcategory tag"
          value={subcategory}
          onChange={setSubcategory}
          placeholder="Sparkling Water"
          hint="Shows as a pill under the brand name"
        />

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Harmful ingredients count"
            type="number"
            value={harmfulCount}
            onChange={setHarmfulCount}
            placeholder="2"
          />
          <Field
            label="Beneficial ingredients count"
            type="number"
            value={beneficialCount}
            onChange={setBeneficialCount}
            placeholder="3"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Microplastics detected"
            value={microplastics}
            onChange={setMicroplastics}
            options={[
              { value: '', label: 'Unknown' },
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes' },
            ]}
          />
          <SelectField
            label="PFAS detected"
            value={pfas}
            onChange={setPfas}
            options={[
              { value: '', label: 'Unknown' },
              { value: 'no', label: 'No' },
              { value: 'yes', label: 'Yes' },
            ]}
          />
        </div>
      </section>

      {/* SECTION 2: Contaminants */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Contaminants</h2>
          <button
            type="button"
            onClick={() =>
              setContaminants([...contaminants, { name: '', amount: '', severity: 'moderate', description: '' }])
            }
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--foreground)]"
          >
            + Add contaminant
          </button>
        </div>

        {contaminants.length === 0 ? (
          <p className="text-sm text-gray-600">None added. Leave empty if no contaminants detected.</p>
        ) : null}

        {contaminants.map((c, i) => (
          <div key={i} className="p-4 border border-[var(--border)] rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                value={c.name}
                onChange={(e) => {
                  const next = [...contaminants]
                  next[i] = { ...next[i], name: e.target.value }
                  setContaminants(next)
                }}
                placeholder="Bromide"
                className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-[var(--text-tertiary)] text-sm"
              />
              <input
                value={c.amount}
                onChange={(e) => {
                  const next = [...contaminants]
                  next[i] = { ...next[i], amount: e.target.value }
                  setContaminants(next)
                }}
                placeholder="0.036 mg/L"
                className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-[var(--text-tertiary)] text-sm"
              />
            </div>
            <select
              value={c.severity}
              onChange={(e) => {
                const next = [...contaminants]
                next[i] = { ...next[i], severity: e.target.value as ProductContaminant['severity'] }
                setContaminants(next)
              }}
              className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--foreground)] text-sm"
            >
              <option value="low">Low concern</option>
              <option value="moderate">Moderate concern</option>
              <option value="high">High concern</option>
            </select>
            <textarea
              value={c.description || ''}
              onChange={(e) => {
                const next = [...contaminants]
                next[i] = { ...next[i], description: e.target.value }
                setContaminants(next)
              }}
              placeholder="Why this matters..."
              rows={2}
              className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-[var(--text-tertiary)] text-sm"
            />
            <button
              type="button"
              onClick={() => setContaminants(contaminants.filter((_, idx) => idx !== i))}
              className="text-xs text-red-500 hover:text-red-400"
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      {/* SECTION 3: Minerals / beneficial ingredients */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Minerals & beneficial ingredients</h2>
          <button
            type="button"
            onClick={() => setMinerals([...minerals, { name: '', amount: '', description: '' }])}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--foreground)]"
          >
            + Add mineral
          </button>
        </div>

        {minerals.map((m, i) => (
          <div key={i} className="p-4 border border-[var(--border)] rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                value={m.name}
                onChange={(e) => {
                  const next = [...minerals]
                  next[i] = { ...next[i], name: e.target.value }
                  setMinerals(next)
                }}
                placeholder="Calcium"
                className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-[var(--text-tertiary)] text-sm"
              />
              <input
                value={m.amount}
                onChange={(e) => {
                  const next = [...minerals]
                  next[i] = { ...next[i], amount: e.target.value }
                  setMinerals(next)
                }}
                placeholder="5.4 mg/L"
                className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-[var(--text-tertiary)] text-sm"
              />
            </div>
            <textarea
              value={m.description || ''}
              onChange={(e) => {
                const next = [...minerals]
                next[i] = { ...next[i], description: e.target.value }
                setMinerals(next)
              }}
              placeholder="What this does in the body..."
              rows={2}
              className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-[var(--text-tertiary)] text-sm"
            />
            <button
              type="button"
              onClick={() => setMinerals(minerals.filter((_, idx) => idx !== i))}
              className="text-xs text-red-500 hover:text-red-400"
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      {/* SECTION 4: Product details */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Product details</h2>
          <button
            type="button"
            onClick={() => setDetails([...details, { label: '', value: '' }])}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--foreground)]"
          >
            + Add detail
          </button>
        </div>

        {details.map((d, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
            <input
              value={d.label}
              onChange={(e) => {
                const next = [...details]
                next[i] = { ...next[i], label: e.target.value }
                setDetails(next)
              }}
              placeholder="Packaging"
              className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-[var(--text-tertiary)] text-sm"
            />
            <input
              value={d.value}
              onChange={(e) => {
                const next = [...details]
                next[i] = { ...next[i], value: e.target.value }
                setDetails(next)
              }}
              placeholder="Glass"
              className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-[var(--text-tertiary)] text-sm"
            />
            <button
              type="button"
              onClick={() => setDetails(details.filter((_, idx) => idx !== i))}
              className="text-xs text-red-500 hover:text-red-400 px-2"
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      {/* SECTION 5: Sources */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Sources</h2>
          <button
            type="button"
            onClick={() => setSources([...sources, { label: '', url: '' }])}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--foreground)]"
          >
            + Add source
          </button>
        </div>

        {sources.map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
            <input
              value={s.label}
              onChange={(e) => {
                const next = [...sources]
                next[i] = { ...next[i], label: e.target.value }
                setSources(next)
              }}
              placeholder="Water Quality Report 2024"
              className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-[var(--text-tertiary)] text-sm"
            />
            <input
              value={s.url}
              onChange={(e) => {
                const next = [...sources]
                next[i] = { ...next[i], url: e.target.value }
                setSources(next)
              }}
              placeholder="https://..."
              className="px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded text-[var(--foreground)] placeholder-[var(--text-tertiary)] text-sm"
            />
            <button
              type="button"
              onClick={() => setSources(sources.filter((_, idx) => idx !== i))}
              className="text-xs text-red-500 hover:text-red-400 px-2"
            >
              Remove
            </button>
          </div>
        ))}
      </section>

      {message ? (
        <div
          className={`p-3 rounded-lg text-sm ${message.type === 'error'
            ? 'bg-red-950 border border-red-900 text-red-400'
            : 'bg-green-950 border border-green-900 text-green-400'
            }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full font-semibold hover:opacity-90 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save details'}
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
  hint,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hint?: string
  type?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-gray-600"
      />
      {hint ? <p className="text-xs text-gray-600 mt-1">{hint}</p> : null}
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-gray-600"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
