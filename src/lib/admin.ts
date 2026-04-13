import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from './supabase-server'

/**
 * Checks that the current user is the admin.
 * Redirects unauthenticated users to /login.
 * Returns a 404 for authenticated non-admins so the admin panel remains hidden.
 * Returns the user object on success.
 */
export async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL
  if (!adminEmail || user.email !== adminEmail) {
    notFound()
  }

  return user
}
