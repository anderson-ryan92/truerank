import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NewLabReportForm } from './NewLabReportForm'
import type { Product } from '@/types/database'

type PageProps = {
  params: Promise<{ slug: string }>
}

export default async function NewLabReportPage({ params }: PageProps) {
  await requireAdmin()
  const { slug } = await params
  const supabase = await createSupabaseServerClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!product) {
    notFound()
  }

  const p = product as Product

  return (
    <main className="min-h-screen px-8 py-16 max-w-xl mx-auto">
      <nav className="mb-8 text-sm">
        <Link href="/admin" className="text-gray-500 hover:text-gray-300">
          ← Back to admin
        </Link>
      </nav>

      <header className="mb-8">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Admin · Add lab report</p>
        <h1 className="text-3xl font-bold mb-1">{p.name}</h1>
        {p.brand ? <p className="text-gray-500">{p.brand}</p> : null}
      </header>

      <NewLabReportForm productId={p.id} productSlug={p.slug} />
    </main>
  )
}
