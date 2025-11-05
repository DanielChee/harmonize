import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client WITHOUT auth persistence
// This allows multiple users/participants to use the same app instance
// Each participant is identified by their participant_id in the data, not by auth session
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // CRITICAL: Don't persist sessions - allows multiple participants per device
    autoRefreshToken: false,
  },
});
