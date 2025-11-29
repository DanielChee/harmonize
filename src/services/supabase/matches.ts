// src/supabase/matches.ts
import type { Review } from '@utils/mockMeets';
import { supabase } from './supabase';

export interface MatchRow {
  id: string;
  user_id: string;
  test_profile_id: string;
  name: string;
  avatar_url: string | null;
  city: string | null;
  age: number | null;
  concert_date: string; // ISO date string from Supabase
  review: Review | null;
  reviewed: boolean;
  created_at: string;
}

export async function upsertMatchForTestProfile(params: {
  userId: string;
  testProfileId: string;
  name: string;
  avatarUrl?: string | null;
  city?: string | null;
  age?: number | null;
  concertDate: string; // "2025-12-15"
}): Promise<MatchRow | null> {
  const { userId, testProfileId, name, avatarUrl, city, age, concertDate } = params;

  const { data, error } = await supabase
    .from('matches')
    .upsert(
      {
        user_id: userId,
        test_profile_id: testProfileId,
        name,
        avatar_url: avatarUrl ?? null,
        city: city ?? null,
        age: age ?? null,
        concert_date: concertDate,
      },
      { onConflict: 'user_id,test_profile_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('[Matches] upsert error', error);
    return null;
  }

  return data as MatchRow;
}

export async function deleteAllMatchesForUser(userId: string) {
  const { error } = await supabase
    .from("matches")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("[Matches] deleteAllMatchesForUser error:", error);
    throw error;
  }
}

export async function fetchMatchesForUser(userId: string): Promise<MatchRow[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('user_id', userId)
    .order('concert_date', { ascending: true });

  if (error) {
    console.error('[Matches] fetch error', error);
    return [];
  }

  return (data || []) as MatchRow[];
}

export async function deleteMatch(matchId: string): Promise<boolean> {
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', matchId);

  if (error) {
    console.error('[Matches] deleteMatch error', error);
    return false;
  }

  return true;
}

export async function updateMatchReview(matchRowId: string, review: Review): Promise<boolean> {
  const { error } = await supabase
    .from('matches')
    .update({ review: review, reviewed: true })
    .eq('id', matchRowId);

  if (error) {
    console.error('[Matches] updateMatchReview error', error);
    return false;
  }

  return true;
}
