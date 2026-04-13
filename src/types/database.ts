export type Category = {
  id: string
  slug: string
  name: string
  description: string | null
  display_order: number
  created_at: string
}

export type Product = {
  id: string
  slug: string
  name: string
  brand: string | null
  category_id: string | null
  image_url: string | null
  purchase_location: string | null
  purchase_price_cents: number | null
  aggregated_data: Record<string, unknown> | null
  is_tested: boolean
  created_at: string
  updated_at: string
}

export type LabReport = {
  id: string
  product_id: string
  lab_name: string
  lab_location: string | null
  test_date: string
  report_pdf_url: string | null
  chain_of_custody_url: string | null
  video_url: string | null
  methodology: string | null
  parsed_data: Record<string, unknown> | null
  is_independent: boolean
  created_at: string
}

export type Score = {
  id: string
  product_id: string
  contaminants_score: number | null
  potency_score: number | null
  transparency_score: number | null
  certifications_score: number | null
  overall_score: number | null
  methodology_version: string
  calculated_at: string
  notes: string | null
}

export type ProductWithRelations = Product & {
  category: Category | null
  lab_reports: LabReport[]
  scores: Score[]
}
