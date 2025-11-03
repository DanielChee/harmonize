/**
 * Supabase Client
 * Initialize and export the Supabase client for database operations
 */

import { createClient } from '@supabase/supabase-js';

// These would normally come from environment variables
// For now, using placeholders - replace with your actual Supabase credentials
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
