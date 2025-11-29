import { createClient } from "@supabase/supabase-js";
import { SecureStoreAdapter } from "../../lib/secureStore"; // Adjust path as necessary

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client with proper authentication
// Uses SecureStoreAdapter for secure session persistence across app restarts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Required for React Native
  },
});
