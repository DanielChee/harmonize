import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Detect web vs native
const isWeb = typeof window !== "undefined";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isWeb ? undefined : AsyncStorage, // don't use AsyncStorage on web
    autoRefreshToken: !isWeb,
    persistSession: !isWeb,
    detectSessionInUrl: isWeb,
  },
});
