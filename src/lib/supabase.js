import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '⚠️  Missing Supabase env vars.\n' +
    'Copy .env.example → .env and fill in your keys from supabase.com'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
