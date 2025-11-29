import ConversationListItem from '@components/meet/ConversationListItem';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import { useFocusEffect } from '@react-navigation/native';
import { deleteMatch, fetchMatchesForUser, updateMatchReview, type MatchRow } from '@services/supabase/matches';
import { useUserStore } from '@store';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Review } from '@utils/mockMeets';

export interface MatchedUser {
  id: string;
  name: string;
  avatar: string;
  age: number;
  city: string;
  phoneNumber: string;
  concertDate: string; // ISO format
  review: Review | null;
  matchRowId: string;
}

function mapMatchRowToMatchedUser(row: MatchRow): MatchedUser {
  return {
    id: row.test_profile_id,      // the matched *profile* id
    matchRowId: row.id,           // the match row itself
    name: row.name || 'Unknown',
    avatar: row.avatar_url || 'https://i.pravatar.cc/300?img=1',
    age: row.age ?? 0,
    city: row.city ?? '',
    phoneNumber: '000-000-0000', // Hardcoded for now
    concertDate: row.concert_date ? new Date(row.concert_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    review: row.review ?? null,
  };
}

export default function MeetScreen() {
  const { currentUser } = useUserStore();
  const [users, setUsers] = useState<MatchedUser[]>([]);
  const [showUnreviewed, setShowUnreviewed] = useState(true);
  const [showReviewed, setShowReviewed] = useState(false);

  const now = new Date();

  const loadMatches = useCallback(async () => {
    if (!currentUser?.id) return;

    const rows = await fetchMatchesForUser(currentUser.id as string);
    const mapped = rows.map(mapMatchRowToMatchedUser);

    setUsers(mapped);
  }, [currentUser]);

  // Refresh when tab is focused
  useFocusEffect(
    useCallback(() => {
      loadMatches();
    }, [loadMatches])
  );

  // Initial load
  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const futureMatches = users
  .filter(u => new Date(u.concertDate) > now);

  const pastUnreviewed = users.filter(
    u => new Date(u.concertDate) <= now && u.review === null
  );
  const pastReviewed = users.filter(
    u => new Date(u.concertDate) <= now && u.review !== null
  );

  const handleSubmitReview = async (id: string, review: Review) => {
    // Find the matchRowId associated with the profile id
    const match = users.find(u => u.id === id);
    if (!match?.matchRowId) {
      console.error('MatchRowId not found for profile:', id);
      return;
    }

    const success = await updateMatchReview(match.matchRowId, review);
    if (success) {
      setUsers(prev =>
        prev.map(u => (u.id === id ? { ...u, review } : u))
      );
    } else {
      console.error('Failed to update review in Supabase for match:', match.matchRowId);
      // Potentially show an alert to the user
    }
  };

  const handleUnmatch = async (id: string) => {
    // Find the matchRowId associated with the profile id
    const match = users.find(u => u.id === id);
    if (!match?.matchRowId) {
      console.error('MatchRowId not found for profile:', id);
      return;
    }

    const success = await deleteMatch(match.matchRowId);
    if (success) {
      setUsers(prev => prev.filter(u => u.id !== id));
    } else {
      Alert.alert('Error', 'Failed to unmatch. Please try again.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: SPACING.xl }}
    >
      <View style={{ height: SPACING.lg }} />
      <Text style={styles.title}>Meet</Text>
      <Text style={styles.subtitle}>Tap a match to review or text them.</Text>

      <Text style={styles.section}>Upcoming Matches</Text>
      {futureMatches.map(u => (
        <ConversationListItem
          key={u.id}
          matchedUser={u}
          onSubmitReview={handleSubmitReview}
          onUnmatch={handleUnmatch}
        />
      ))}

      <View style={styles.dropdownHeader}>
        <Text style={styles.section}>Past Matches (Unreviewed)</Text>
        <Text
          style={styles.chevron}
          onPress={() => setShowUnreviewed(prev => !prev)}
        >
          {showUnreviewed ? '▲' : '▼'}
        </Text>
      </View>
      {showUnreviewed &&
        pastUnreviewed.map(u => (
          <ConversationListItem
            key={u.id}
            matchedUser={u}
            onSubmitReview={handleSubmitReview}
            onUnmatch={handleUnmatch}
          />
        ))}

      <View style={styles.dropdownHeader}>
        <Text style={styles.section}>Past Matches (Reviewed)</Text>
        <Text
          style={styles.chevron}
          onPress={() => setShowReviewed(prev => !prev)}
        >
          {showReviewed ? '▲' : '▼'}
        </Text>
      </View>
      {showReviewed &&
        pastReviewed.map(u => (
          <ConversationListItem
            key={u.id}
            matchedUser={u}
            onSubmitReview={handleSubmitReview}
            onUnmatch={handleUnmatch}
          />
        ))}

      <View style={{ height: SPACING.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  section: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginLeft: SPACING.lg,
    marginTop: SPACING.md,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: SPACING.lg,
  },
  chevron: {
    marginRight: SPACING.xs,
    color: COLORS.text.secondary,
    fontSize: TYPOGRAPHY.sizes.base,
  },
});
