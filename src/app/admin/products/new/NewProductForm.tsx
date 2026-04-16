'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { Category } from '@/types/database'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

type Props = {
  categories: Category[]
}

export function NewProductForm({ categories }: Props) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '')
  const [imageUrl, setImageUrl] = useState('')
  const [purchaseLocation, setPurchaseLocation] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const slug = slugify(`${brand} ${name}`) || slugify(name)
    if (!slug) {
      setMessage({ type: 'error', text: 'Name is required.' })
      setIsLoading(false)
      return
    }

    const priceCents = purchasePrice
      ? Math.round(parseFloat(purchasePrice) * 100)
      : null

    const { error } = await supabase.from('products').insert({
      slug,
      name: name.trim(),
      brand: brand.trim() || null,
      category_id: categoryId || null,
      image_url: imageUrl.trim() || null,
      purchase_location: purchaseLocation.trim() || null,
      purchase_price_cents: priceCents,
      is_tested: false,
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
      setIsLoading(false)
    } else {
      router.refresh()
      router.push(`/products/${slug}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field
        label="Product name"
        required
        value={name}
        onChange={setName}
        placeholder="Fiji Natural Artesian Water 500ml"
      />
      <Field
        label="Brand"
        value={brand}
        onChange={setBrand}
        placeholder="Fiji Water"
      />

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:border-gray-600"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <Field
        label="Image URL"
        value={imageUrl}
        onChange={setImageUrl}
        placeholder="https://..."
      />
      <Field
        label="Purchase location"
        value={purchaseLocation}
        onChange={setPurchaseLocation}
        placeholder="Whole Foods Market, Austin TX"
      />
      <Field
        label="Purchase price (USD)"
        type="number"
        step="0.01"
        value={purchasePrice}
        onChange={setPurchasePrice}
        placeholder="3.49"
      />

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
          disabled={isLoading || !name.trim()}
          className="px-6 py-3 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-full font-semibold hover:opacity-90 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Creating...' : 'Create product'}
        </button>
        <Link
          href="/admin"
          className="px-6 py-3 text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
        >
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
  type = 'text',
  step,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  type?: string
  step?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      <input
        type={type}
        step={step}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-gray-600"
      />
    </div>
  )
}
