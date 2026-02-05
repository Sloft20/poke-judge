import { createClient } from '@supabase/supabase-js'

// Usamos import.meta.env para o Vite reconhecer as variáveis da Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)