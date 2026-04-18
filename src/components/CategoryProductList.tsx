'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Product, Score } from '@/types/database'
import type { ProductDetailsData } from '@/types/product-details'

type RankedItem = {
  product: Product
  latestScore: Score
}

type UnrankedItem = {
  product: Product
}

type Props = {
  ranked: RankedItem[]
  unranked: UnrankedItem[]
  categoryName: string
}

export function CategoryProductList({ ranked, unranked, categoryName }: Props) {
  const [filter, setFilter] = useState<string>('all')

  // Extract unique subcategories from all products
  const allProducts = [...ranked.map(r => r.product), ...unranked.map(u => u.product)]
  const subcategories = Array.from(
    new Set(
      allProducts
        .map(p => (p.aggregated_data as ProductDetailsData)?.subcategory)
        .filter((s): s is string => !!s)
    )
  ).sort()

  // Filter products by subcategory
  const filteredRanked = filter === 'all'
    ? ranked
    : ranked.filter(r => (r.product.aggregated_data as ProductDetailsData)?.subcategory === filter)

  const filteredUnranked = filter === 'all'
    ? unranked
    : unranked.filter(u => (u.product.aggregated_data as ProductDetailsData)?.subcategory === filter)

  return (
    <>
      {subcategories.length > 1 ? (
        <div className="mb-8 flex flex-wrap gap-2">
          <FilterPill label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
          {subcategories.map(sub => (
            <FilterPill key={sub} label={sub} active={filter === sub} onClick={() => setFilter(sub)} />
          ))}
        </div>
      ) : null}

      {filteredRanked.length > 0 ? (
        <section className="mb-16">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Highest ranked
            </h2>
            <span className="text-xs text-[var(--text-tertiary)]">
              {filteredRanked.length} {filteredRanked.length === 1 ? 'product' : 'products'} tested
            </span>
          </div>

          <div className="flex flex-col">
            {filteredRanked.map((item, index) => (
              <RankRow
                key={item.product.id}
                product={item.product}
                score={item.latestScore}
                rank={index + 1}
              />
            ))}
          </div>
        </section>
      ) : null}

      {filteredUnranked.length > 0 ? (
        <section>
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Up next for testing
            </h2>
            <span className="text-xs text-[var(--text-tertiary)]">
              {filteredUnranked.length} {filteredUnranked.length === 1 ? 'product' : 'products'}
            </span>
          </div>

          <div className="flex flex-col">
            {filteredUnranked.map((item) => (
              <UnrankedRow key={item.product.id} product={item.product} />
            ))}
          </div>
        </section>
      ) : null}

      {filteredRanked.length === 0 && filteredUnranked.length === 0 ? (
        <div className="p-12 border border-dashed border-[var(--border)] rounded-2xl text-center">
          <p className="text-[var(--text-secondary)] mb-2">No {filter.toLowerCase()} products in {categoryName.toLowerCase()} yet.</p>
          <p className="text-sm text-[var(--text-tertiary)]">Check back soon.</p>
        </div>
      ) : null}
    </>
  )
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active
          ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
          : 'bg-transparent border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]'
      }`}
    >
      {label}
    </button>
  )
}

function RankRow({ product, score, rank }: { product: Product; score: Score; rank: number }) {
  const details = (product.aggregated_data || {}) as ProductDetailsData

  return (
    <Link
      href={`/products/${product.slug}`}
      className="grid grid-cols-[32px_56px_1fr_auto] gap-4 items-center py-5 border-t border-[var(--border)] last:border-b hover:bg-[var(--surface-hover)] transition-colors px-2 -mx-2 rounded-lg"
    >
      <div className="text-sm text-[var(--text-tertiary)] tabular-nums">
        {rank.toString().padStart(2, '0')}
      </div>
      <div className="w-14 h-14 bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden flex items-center justify-center">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-2" />
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="font-medium truncate text-[var(--foreground)]">{product.name}</p>
        <p className="text-sm text-[var(--text-tertiary)] truncate">
          {product.brand ? `${product.brand}` : ''}
          {details.subcategory ? ` · ${details.subcategory}` : ''}
        </p>
      </div>
      <div className="text-2xl font-medium tabular-nums tracking-tight text-[var(--foreground)]">
        {score.overall_score}
      </div>
    </Link>
  )
}

function UnrankedRow({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="grid grid-cols-[56px_1fr_auto] gap-4 items-center py-4 border-t border-[var(--border)] last:border-b hover:bg-[var(--surface-hover)] transition-colors px-2 -mx-2 rounded-lg"
    >
      <div className="w-14 h-14 bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden flex items-center justify-center">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-2" />
        ) : null}
      </div>
      <div className="min-w-0">
        <p className="font-medium truncate text-[var(--foreground)]">{product.name}</p>
        {product.brand ? <p className="text-sm text-[var(--text-tertiary)] truncate">{product.brand}</p> : null}
      </div>
      <div className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider">Pending</div>
    </Link>
  )
}
