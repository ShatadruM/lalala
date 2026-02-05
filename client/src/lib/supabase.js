import { createClient } from '@supabase/supabase-js'

// Use the PUBLIC ANON KEY here. It's safe for the browser.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)