/**
 * Supabase Sync Utility
 * Syncs A/B test data from AsyncStorage to Supabase
 */

import { supabase } from '@services/supabase/supabase';
import type { ProfileInteractionMetrics, UserVariantAssignment } from '@types';

/**
 * Sync user variant assignment to Supabase
 */
export async function syncAssignment(assignment: UserVariantAssignment): Promise<void> {
  try {
    console.log('[Supabase Sync] Starting assignment sync for user:', assignment.userId);

    const payload = {
      user_id: assignment.userId,
      assigned_variant: assignment.assignedVariant,
      assigned_at: new Date(assignment.assignedAt).toISOString(),
      created_at: new Date(assignment.assignedAt).toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('[Supabase Sync] Assignment payload:', JSON.stringify(payload, null, 2));

    const { data, error } = await supabase.from('ab_test_assignments').upsert(payload);

    if (error) {
      console.error('[Supabase Sync] ❌ Error syncing assignment:', JSON.stringify(error, null, 2));
      console.error('[Supabase Sync] Error details:', error.message, error.code, error.hint);
      throw error;
    }

    console.log('[Supabase Sync] ✅ Assignment synced successfully for user:', assignment.userId);
    console.log('[Supabase Sync] Response data:', data);
  } catch (error: any) {
    console.error('[Supabase Sync] ❌ CRITICAL: Failed to sync assignment for user:', assignment.userId);
    console.error('[Supabase Sync] Error type:', error?.name);
    console.error('[Supabase Sync] Error message:', error?.message);
    console.error('[Supabase Sync] Full error:', error);
    // Don't throw - allow app to continue even if sync fails
  }
}

/**
 * Sync a single interaction to Supabase
 */
export async function syncInteraction(
  userId: string,
  interaction: ProfileInteractionMetrics
): Promise<void> {
  try {
    console.log(`[Supabase Sync] Starting interaction sync for user: ${userId}`);

    const timeSpent = interaction.timeSpentSeconds || 0;

    const payload = {
      user_id: userId,
      variant_shown: interaction.variantShown,
      profile_id: interaction.profileId,
      profile_type: interaction.profileType,
      profile_load_time: new Date(interaction.profileLoadTime).toISOString(),
      decision_time: interaction.decisionTime
        ? new Date(interaction.decisionTime).toISOString()
        : null,
      time_spent_seconds: timeSpent,
      decision: interaction.decision || null,
      decision_correct: interaction.decisionCorrect || null,
      session_id: interaction.sessionId || null,
      device_type: interaction.deviceType || null,
      created_at: new Date(interaction.timestamp).toISOString(),
    };

    console.log('[Supabase Sync] Interaction payload:', JSON.stringify(payload, null, 2));

    const { data, error } = await supabase.from('ab_test_interactions').insert(payload);

    if (error) {
      console.error('[Supabase Sync] ❌ Error syncing interaction:', JSON.stringify(error, null, 2));
      console.error('[Supabase Sync] Error details:', error.message, error.code, error.hint);
      throw error;
    }

    console.log(
      `[Supabase Sync] ✅ Interaction synced: ${interaction.decision} on ${interaction.profileType} for user ${userId}`
    );
    console.log('[Supabase Sync] Response data:', data);
  } catch (error: any) {
    console.error(`[Supabase Sync] ❌ CRITICAL: Failed to sync interaction for user: ${userId}`);
    console.error('[Supabase Sync] Error type:', error?.name);
    console.error('[Supabase Sync] Error message:', error?.message);
    console.error('[Supabase Sync] Full error:', error);
    // Don't throw - allow app to continue even if sync fails
  }
}

/**
 * Sync all interactions for a user to Supabase
 */
export async function syncAllInteractions(
  userId: string,
  interactions: ProfileInteractionMetrics[]
): Promise<void> {
  try {
    if (interactions.length === 0) {
      console.log('[Supabase Sync] No interactions to sync');
      return;
    }

    const interactionsData = interactions.map((interaction) => ({
      user_id: userId,
      variant_shown: interaction.variantShown,
      profile_id: interaction.profileId,
      profile_type: interaction.profileType,
      profile_load_time: new Date(interaction.profileLoadTime).toISOString(),
      decision_time: interaction.decisionTime
        ? new Date(interaction.decisionTime).toISOString()
        : null,
      time_spent_seconds: interaction.timeSpentSeconds || 0,
      decision: interaction.decision || null,
      decision_correct: interaction.decisionCorrect || null,
      session_id: interaction.sessionId || null,
      device_type: interaction.deviceType || null,
      created_at: new Date(interaction.timestamp).toISOString(),
    }));

    const { error } = await supabase.from('ab_test_interactions').insert(interactionsData);

    if (error) {
      console.error('[Supabase Sync] Error syncing all interactions:', error);
      throw error;
    }

    console.log(`[Supabase Sync] ${interactions.length} interactions synced`);
  } catch (error) {
    console.error('[Supabase Sync] Failed to sync all interactions:', error);
    // Don't throw - allow app to continue even if sync fails
  }
}

/**
 * Get all interactions for a user from Supabase
 */
export async function getInteractionsFromSupabase(
  userId: string
): Promise<ProfileInteractionMetrics[]> {
  try {
    const { data, error } = await supabase
      .from('ab_test_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Supabase Sync] Error fetching interactions:', error);
      throw error;
    }

    // Convert Supabase data to ProfileInteractionMetrics format
    const interactions: ProfileInteractionMetrics[] = (data || []).map((row: any) => ({
      profileId: row.profile_id,
      profileType: row.profile_type,
      variantShown: row.variant_shown,
      profileLoadTime: new Date(row.profile_load_time).getTime(),
      decisionTime: row.decision_time ? new Date(row.decision_time).getTime() : undefined,
      timeSpentSeconds: row.time_spent_seconds,
      decision: row.decision,
      decisionCorrect: row.decision_correct,
      deviceType: row.device_type,
      sessionId: row.session_id,
      timestamp: new Date(row.created_at).getTime(),
    }));

    console.log(`[Supabase Sync] Fetched ${interactions.length} interactions from Supabase`);
    return interactions;
  } catch (error) {
    console.error('[Supabase Sync] Failed to fetch interactions:', error);
    return [];
  }
}

/**
 * Check if user exists in Supabase
 */
export async function checkUserExists(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('ab_test_assignments')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('[Supabase Sync] Error checking user:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('[Supabase Sync] Failed to check user:', error);
    return false;
  }
}

/**
 * Get variant assignment from Supabase
 */
export async function getAssignmentFromSupabase(
  userId: string
): Promise<UserVariantAssignment | null> {
  try {
    const { data, error } = await supabase
      .from('ab_test_assignments')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('[Supabase Sync] Error fetching assignment:', error);
      throw error;
    }

    if (!data) return null;

    // Fetch interactions for this user
    const interactions = await getInteractionsFromSupabase(userId);

    const assignment: UserVariantAssignment = {
      userId: data.user_id,
      assignedVariant: data.assigned_variant,
      assignedAt: new Date(data.assigned_at).getTime(),
      testProfilesShown: interactions.map((i) => i.profileId),
      interactions,
    };

    return assignment;
  } catch (error) {
    console.error('[Supabase Sync] Failed to fetch assignment:', error);
    return null;
  }
}

/**
 * Export all data from Supabase for a user (for researchers)
 */
export async function exportUserDataFromSupabase(userId: string): Promise<string> {
  try {
    const assignment = await getAssignmentFromSupabase(userId);

    if (!assignment) {
      return JSON.stringify({ error: 'User not found' }, null, 2);
    }

    return JSON.stringify(assignment, null, 2);
  } catch (error) {
    console.error('[Supabase Sync] Failed to export data:', error);
    return JSON.stringify({ error: 'Failed to export data' }, null, 2);
  }
}
