/**
 * Shape of the `aggregated_data` jsonb column on products.
 * All fields optional — not every category uses every field.
 */

export type ProductContaminant = {
  name: string
  amount: string        // e.g. "0.036 mg/L"
  severity: 'low' | 'moderate' | 'high'
  description?: string
}

export type ProductMineral = {
  name: string
  amount: string        // e.g. "5.4 mg/L"
  description?: string  // short nutritional context
}

export type ProductDetail = {
  label: string         // e.g. "Cap Material"
  value: string         // e.g. "Painted Aluminum Screw"
}

export type ProductSource = {
  label: string         // e.g. "Icelandic Glacial Water Quality Report April 2024"
  url: string
}

export type ProductDetailsData = {
  // Summary stats shown at the top of the page
  harmful_ingredients_count?: number | null
  beneficial_ingredients_count?: number | null
  microplastics_detected?: boolean | null
  pfas_detected?: boolean | null

  // The three detailed sections
  contaminants?: ProductContaminant[]
  minerals?: ProductMineral[]
  details?: ProductDetail[]
  sources?: ProductSource[]

  // Category tag shown below the brand
  subcategory?: string  // e.g. "Sparkling Water", "Electrolyte Mix"

  // Seed metadata (existing)
  source?: string
  source_code?: string
  source_url?: string
  seeded_at?: string
  categories_tags?: string[]
}
