import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { NewProductForm } from './NewProductForm'
import type { Category } from '@/types/database'

export default async function NewProductPage() {
  await requireAdmin()
  const supabase = await createSupabaseServerClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })

  return (
    <main className="min-h-screen px-8 py-16 max-w-xl mx-auto">
      <nav className="mb-8 text-sm">
        <Link href="/admin" className="text-gray-500 hover:text-[var(--foreground)]">
          ← Back to admin
        </Link>
      </nav>

      <header className="mb-8">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Admin</p>
        <h1 className="text-4xl font-bold mb-2">Add a product</h1>
        <p className="text-gray-500">Create a new product entry in the catalog.</p>
      </header>

      <NewProductForm categories={(categories as Category[]) || []} />
    </main>
  )
}
