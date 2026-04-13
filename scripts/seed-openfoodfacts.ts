/**
 * Seed script: pulls bottled water products from Open Food Facts
 * and inserts them into our Supabase products table.
 *
 * Usage: npx tsx scripts/seed-openfoodfacts.ts
 *
 * Data license: Open Database License (ODbL)
 * Attribution: https://world.openfoodfacts.org
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

type OFFProduct = {
  code: string
  product_name?: string
  brands?: string
  image_url?: string
  image_front_url?: string
  categories_tags_en?: string[]
  countries_tags?: string[]
}

type OFFSearchResponse = {
  count: number
  page: number
  page_count: number
  products: OFFProduct[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

async function fetchBottledWaters(): Promise<OFFProduct[]> {
  const url = new URL('https://world.openfoodfacts.org/api/v2/search')
  url.searchParams.set('categories_tags_en', 'Bottled waters')
  url.searchParams.set('countries_tags_en', 'United States')
  url.searchParams.set('fields', 'code,product_name,brands,image_url,image_front_url,categories_tags_en,countries_tags')
  url.searchParams.set('page_size', '30')
  url.searchParams.set('sort_by', 'popularity_key')

  console.log('Fetching bottled waters from Open Food Facts...')
  console.log(`URL: ${url.toString()}`)

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'OptimalSource/0.1 (https://optimalsource.app)',
    },
  })

  if (!response.ok) {
    throw new Error(`Open Food Facts API returned ${response.status}: ${response.statusText}`)
  }

  const data = (await response.json()) as OFFSearchResponse
  console.log(`Got ${data.products.length} products (total available: ${data.count})`)
  return data.products
}

async function seedProducts() {
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', 'bottled-water')
    .single()

  if (catError || !category) {
    console.error('Could not find bottled-water category:', catError?.message)
    process.exit(1)
  }

  const products = await fetchBottledWaters()

  const validProducts = products.filter((p) => p.product_name && p.product_name.trim().length > 0)
  console.log(`${validProducts.length} products have valid names`)

  let inserted = 0
  let skipped = 0

  for (const p of validProducts) {
    const name = p.product_name!.trim()
    const brand = p.brands?.split(',')[0]?.trim() || null
    const imageUrl = p.image_front_url || p.image_url || null
    const slug = slugify(`${brand || ''} ${name}`) || slugify(name)

    if (!slug) {
      skipped++
      continue
    }

    const { error } = await supabase.from('products').upsert(
      {
        slug,
        name,
        brand,
        category_id: category.id,
        image_url: imageUrl,
        is_tested: false,
        aggregated_data: {
          source: 'openfoodfacts',
          source_code: p.code,
          source_url: `https://world.openfoodfacts.org/product/${p.code}`,
          categories_tags: p.categories_tags_en || [],
        },
      },
      { onConflict: 'slug' }
    )

    if (error) {
      console.error(`Failed to insert "${name}":`, error.message)
      skipped++
    } else {
      console.log(`  ✓ ${brand ? `${brand} — ` : ''}${name}`)
      inserted++
    }
  }

  console.log(`\nDone. Inserted/updated: ${inserted}, Skipped: ${skipped}`)
}

seedProducts().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
