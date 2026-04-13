'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Product, Category } from '@/types/database'

type SearchResult = Product & {
  categories: Pick<Category, 'name' | 'slug'> | null
}

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsLoading(true)
      const { data } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .or(`name.ilike.%${query.trim()}%,brand.ilike.%${query.trim()}%`)
        .limit(10)

      setResults((data as SearchResult[]) || [])
      setIsLoading(false)
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search a product or brand"
          className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-800 rounded-full text-white placeholder-gray-500 focus:outline-none focus:border-gray-600 transition-colors"
        />
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-gray-950 border border-gray-800 rounded-lg shadow-2xl overflow-hidden z-50">
          {isLoading ? (
            <div className="p-4 text-sm text-gray-500 text-center">Searching...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-sm text-gray-500 text-center">
              No products found for &quot;{query}&quot;
            </div>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {results.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/products/${product.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 p-4 hover:bg-gray-900 transition-colors border-b border-gray-800 last:border-b-0"
                  >
                    <div className="w-12 h-12 bg-gray-800 rounded flex-shrink-0 flex items-center justify-center">
                      {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded" />
                      ) : (
                        <span className="text-xs text-gray-600">No image</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{product.name}</p>
                      {product.categories ? (
                        <p className="text-xs text-gray-500">{product.categories.name}</p>
                      ) : product.brand ? (
                        <p className="text-xs text-gray-500">{product.brand}</p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
