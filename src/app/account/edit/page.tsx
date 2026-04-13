import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { EditProfileForm } from './EditProfileForm'

export default async function EditProfilePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <main className="min-h-screen px-8 py-16 max-w-xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Edit profile</h1>
        <p className="text-gray-500">Update your display name and location.</p>
      </header>

      <EditProfileForm
        initialDisplayName={profile?.display_name || ''}
        initialZipCode={profile?.zip_code || ''}
      />
    </main>
  )
}
