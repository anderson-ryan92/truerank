'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/types/database'

type Props = {
  products: Product[]
}

export function AdminProductList({ products }: Props) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'tested' | 'untested'>('all')

  const filtered = products.filter((p) => {
    const matchesSearch =
      search.trim() === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      filter === 'all' ||
      (filter === 'tested' && p.is_tested) ||
      (filter === 'untested' && !p.is_tested)

    return matchesSearch && matchesFilter
  })

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          All products
        </h2>
        <span className="text-xs text-[var(--text-tertiary)]">
          {filtered.length} of {products.length}
        </span>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--border-strong)] bg-transparent"
        />
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            filter === 'all'
              ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
              : 'border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('tested')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            filter === 'tested'
              ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
              : 'border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
          }`}
        >
          Tested
        </button>
        <button
          onClick={() => setFilter('untested')}
          className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            filter === 'untested'
              ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
              : 'border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
          }`}
        >
          Untested
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="p-8 border border-dashed border-[var(--border)] rounded-lg text-center text-[var(--text-tertiary)]">
          No products found.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="p-4 border border-[var(--border)] rounded-lg flex items-center justify-between hover:border-[var(--border-strong)] transition-colors"
            >
              <div className="flex items-center gap-3">
                {product.is_tested ? (
                  <span className="w-2 h-2 rounded-full bg-[var(--good)]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[var(--border-strong)]" />
                )}
                <div>
                  <p className="font-medium text-[var(--foreground)]">{product.name}</p>
                  {product.brand ? (
                    <p className="text-xs text-[var(--text-tertiary)]">{product.brand}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Link
                  href={`/admin/products/${product.slug}/details`}
                  className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
                >
                  Edit details
                </Link>
                <Link
                  href={`/admin/products/${product.slug}/lab-report`}
                  className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
                >
                  + Lab report
                </Link>
                <Link
                  href={`/admin/products/${product.slug}/score`}
                  className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors"
                >
                  + Score
                </Link>
                <Link
                  href={`/products/${product.slug}`}
                  className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
