/**
 * Generic product data import script.
 * Reads a JSON file and populates product details, images, and scores.
 *
 * Usage: npx tsx scripts/seed-product-data.ts data/bottled-water.json
 *
 * Reusable for any category. Just create a new JSON file following the same schema.
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readFileSync } from 'fs'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

type ProductData = {
  slug: string
  image_url: string | null
  details: {
    subcategory?: string
    harmful_ingredients_count?: number | null
    beneficial_ingredients_count?: number | null
    microplastics_detected?: boolean | null
    pfas_detected?: boolean | null
    contaminants?: Array<{
      name: string
      amount: string
      severity: 'low' | 'moderate' | 'high'
      description?: string
    }>
    minerals?: Array<{
      name: string
      amount: string
      description?: string
    }>
    details?: Array<{
      label: string
      value: string
    }>
    sources?: Array<{
      label: string
      url: string
    }>
  }
  scores: {
    contaminants_score: number
    potency_score: number
    transparency_score: number
    certifications_score: number
    notes: string
  }
}

type DataFile = {
  category_slug: string
  methodology_version: string
  products: ProductData[]
}

async function main() {
  const filePath = process.argv[2]
  if (!filePath) {
    console.error('Usage: npx tsx scripts/seed-product-data.ts <path-to-json>')
    console.error('Example: npx tsx scripts/seed-product-data.ts data/bottled-water.json')
    process.exit(1)
  }

  const raw = readFileSync(filePath, 'utf-8')
  const data: DataFile = JSON.parse(raw)

  console.log(`\nImporting ${data.products.length} products for category: ${data.category_slug}`)
  console.log(`Methodology version: ${data.methodology_version}\n`)

  let updated = 0
  let scored = 0
  let failed = 0

  for (const product of data.products) {
    // Find the existing product by slug
    const { data: existing, error: findError } = await supabase
      .from('products')
      .select('id, slug, aggregated_data')
      .eq('slug', product.slug)
      .single()

    if (findError || !existing) {
      console.error(`  ✗ ${product.slug}: product not found in database`)
      failed++
      continue
    }

    // Merge new details with any existing aggregated_data
    const mergedData = {
      ...(existing.aggregated_data || {}),
      ...product.details,
    }

    // Update product with details and image
    const { error: updateError } = await supabase
      .from('products')
      .update({
        aggregated_data: mergedData,
        image_url: product.image_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    if (updateError) {
      console.error(`  ✗ ${product.slug}: failed to update details: ${updateError.message}`)
      failed++
      continue
    }

    console.log(`  ✓ ${product.slug}: details and image updated`)
    updated++

    // Calculate overall score
    const s = product.scores
    const overall = Math.round(
      (s.contaminants_score + s.potency_score + s.transparency_score + s.certifications_score) / 4
    )

    // Insert score
    const { error: scoreError } = await supabase
      .from('scores')
      .insert({
        product_id: existing.id,
        contaminants_score: s.contaminants_score,
        potency_score: s.potency_score,
        transparency_score: s.transparency_score,
        certifications_score: s.certifications_score,
        overall_score: overall,
        methodology_version: data.methodology_version,
        notes: s.notes,
      })

    if (scoreError) {
      console.error(`  ✗ ${product.slug}: failed to insert score: ${scoreError.message}`)
    } else {
      console.log(`  ✓ ${product.slug}: scored ${overall}/100 (C:${s.contaminants_score} P:${s.potency_score} T:${s.transparency_score} Ce:${s.certifications_score})`)
      scored++
    }
  }

  console.log(`\nDone. Updated: ${updated}, Scored: ${scored}, Failed: ${failed}`)
}

main().catch((err) => {
  console.error('Import failed:', err)
  process.exit(1)
})
