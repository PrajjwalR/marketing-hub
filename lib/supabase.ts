import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Standard client for client-side interactions
export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Admin client with full privileges (service role)
 * SECURE: Only initialized if the secret key is present (server-side only)
 */
export const supabaseAdmin = (typeof window === 'undefined' && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null as any; // Cast as any to avoid type errors in client components
