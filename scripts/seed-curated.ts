/**
 * Seed script: hand-curated bottled water products.
 * No external dependencies. Idempotent via upsert on slug.
 *
 * Usage: npx tsx scripts/seed-curated.ts
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

type SeedProduct = {
  slug: string
  name: string
  brand: string
  purchase_location?: string
  purchase_price_cents?: number
}

const BOTTLED_WATERS: SeedProduct[] = [
  { slug: 'fiji-natural-artesian-water-500ml', name: 'Fiji Natural Artesian Water 500ml', brand: 'Fiji Water' },
  { slug: 'fiji-natural-artesian-water-1l', name: 'Fiji Natural Artesian Water 1L', brand: 'Fiji Water' },
  { slug: 'evian-natural-spring-water-500ml', name: 'Evian Natural Spring Water 500ml', brand: 'Evian' },
  { slug: 'evian-natural-spring-water-1l', name: 'Evian Natural Spring Water 1L', brand: 'Evian' },
  { slug: 'voss-artesian-still-water-500ml', name: 'Voss Artesian Still Water 500ml', brand: 'Voss' },
  { slug: 'voss-sparkling-water-375ml', name: 'Voss Sparkling Water 375ml', brand: 'Voss' },
  { slug: 'mountain-valley-spring-water-1l-glass', name: 'Mountain Valley Spring Water 1L Glass', brand: 'Mountain Valley' },
  { slug: 'mountain-valley-spring-water-333ml-glass', name: 'Mountain Valley Spring Water 333ml Glass', brand: 'Mountain Valley' },
  { slug: 'liquid-death-mountain-water-500ml', name: 'Liquid Death Mountain Water 500ml', brand: 'Liquid Death' },
  { slug: 'liquid-death-sparkling-500ml', name: 'Liquid Death Sparkling 500ml', brand: 'Liquid Death' },
  { slug: 'topo-chico-mineral-water-355ml', name: 'Topo Chico Mineral Water 355ml', brand: 'Topo Chico' },
  { slug: 'essentia-ionized-alkaline-water-1l', name: 'Essentia Ionized Alkaline Water 1L', brand: 'Essentia' },
  { slug: 'smartwater-vapor-distilled-1l', name: 'Smartwater Vapor Distilled 1L', brand: 'Smartwater' },
  { slug: 'smartwater-alkaline-1l', name: 'Smartwater Alkaline 1L', brand: 'Smartwater' },
  { slug: 'waiakea-hawaiian-volcanic-water-500ml', name: 'Waiakea Hawaiian Volcanic Water 500ml', brand: 'Waiakea' },
  { slug: 'flow-alkaline-spring-water-1l', name: 'Flow Alkaline Spring Water 1L', brand: 'Flow' },
  { slug: 'icelandic-glacial-natural-spring-water-500ml', name: 'Icelandic Glacial Natural Spring Water 500ml', brand: 'Icelandic Glacial' },
  { slug: 'acqua-panna-natural-spring-water-1l', name: 'Acqua Panna Natural Spring Water 1L', brand: 'Acqua Panna' },
  { slug: 'san-pellegrino-sparkling-mineral-water-750ml', name: 'San Pellegrino Sparkling Mineral Water 750ml', brand: 'San Pellegrino' },
  { slug: 'perrier-sparkling-mineral-water-750ml', name: 'Perrier Sparkling Mineral Water 750ml', brand: 'Perrier' },
  { slug: 'gerolsteiner-sparkling-mineral-water-750ml', name: 'Gerolsteiner Sparkling Mineral Water 750ml', brand: 'Gerolsteiner' },
  { slug: 'poland-spring-natural-spring-water-500ml', name: 'Poland Spring Natural Spring Water 500ml', brand: 'Poland Spring' },
  { slug: 'crystal-geyser-alpine-spring-water-1l', name: 'Crystal Geyser Alpine Spring Water 1L', brand: 'Crystal Geyser' },
  { slug: 'dasani-purified-water-500ml', name: 'Dasani Purified Water 500ml', brand: 'Dasani' },
  { slug: 'aquafina-purified-water-500ml', name: 'Aquafina Purified Water 500ml', brand: 'Aquafina' },
  { slug: 'whole-foods-365-purified-water-1l', name: 'Whole Foods 365 Purified Water 1L', brand: '365 by Whole Foods Market' },
  { slug: 'whole-foods-365-spring-water-1l', name: 'Whole Foods 365 Spring Water 1L', brand: '365 by Whole Foods Market' },
  { slug: 'mountain-valley-sparkling-333ml-glass', name: 'Mountain Valley Sparkling 333ml Glass', brand: 'Mountain Valley' },
  { slug: 'gerolsteiner-mineral-water-330ml-glass', name: 'Gerolsteiner Mineral Water 330ml Glass', brand: 'Gerolsteiner' },
  { slug: 'sole-mineral-water-1l-glass', name: 'Sole Mineral Water 1L Glass', brand: 'Sole' },
]

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

  console.log(`Seeding ${BOTTLED_WATERS.length} hand-curated bottled water products...\n`)

  let inserted = 0
  let failed = 0

  for (const p of BOTTLED_WATERS) {
    const { error } = await supabase.from('products').upsert(
      {
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        category_id: category.id,
        purchase_location: p.purchase_location || null,
        purchase_price_cents: p.purchase_price_cents || null,
        is_tested: false,
        aggregated_data: { source: 'curated', seeded_at: new Date().toISOString() },
      },
      { onConflict: 'slug' }
    )

    if (error) {
      console.error(`  ✗ ${p.brand} — ${p.name}: ${error.message}`)
      failed++
    } else {
      console.log(`  ✓ ${p.brand} — ${p.name}`)
      inserted++
    }
  }

  console.log(`\nDone. Inserted/updated: ${inserted}, Failed: ${failed}`)
}

seedProducts().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
