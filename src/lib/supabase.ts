import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
export async function uploadFile(file: File, folder = 'assets'): Promise<string | null> {
  const ext = file.name.split('.').pop()
  const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('assets').upload(name, file, { cacheControl: '3600', upsert: false })
  if (error) { console.error(error); return null }
  return supabase.storage.from('assets').getPublicUrl(name).data.publicUrl
}
