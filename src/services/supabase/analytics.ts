import { supabase } from "./supabase";

export interface ProfileCreationMetric {
  id: string;
  user_id: string;
  variant_assigned: 'A' | 'B';
  time_taken_seconds: number | null;
  number_of_edits: number;
  satisfaction_score: boolean;
  perceived_accuracy_score: number | null;
  spotify_login_status: 'success' | 'failed' | 'not_attempted';
  created_at: string;
}

export async function getProfileCreationMetrics(): Promise<ProfileCreationMetric[]> {
  try {
    const { data, error } = await supabase
      .from('ab_test_profile_creation_metrics')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching profile creation metrics:', error);
      return [];
    }

    return data as ProfileCreationMetric[];
  } catch (error) {
    console.error('Failed to fetch profile creation metrics:', error);
    return [];
  }
}
