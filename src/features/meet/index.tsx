import ConversationListItem from '@components/meet/ConversationListItem';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import { useFocusEffect } from '@react-navigation/native';
import { fetchMatchesForUser, type MatchRow } from '@services/supabase/matches';
import { useUserStore } from '@store';
import { MOCK_USERS, type MockUser, type Review } from '@utils/mockMeets';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

function mapMatchRowToMockUser(row: MatchRow): MockUser {
  return {
    id: row.test_profile_id,      // the matched *profile* id
    matchRowId: row.id,           // the match row itself
    name: row.name,
    avatar: row.avatar_url || 'https://i.pravatar.cc/300?img=1',
    age: row.age ?? 0,
    city: row.city ?? '',
    phoneNumber: '000-000-0000',
    concertDate: row.concert_date,
    review: row.review ?? null,
    source: 'match',
  };
}

export default function MeetScreen() {
  const { currentUser } = useUserStore();
  const [users, setUsers] = useState<MockUser[]>([]);   // FIX 1: start EMPTY instead of MOCK_USERS
  const [showUnreviewed, setShowUnreviewed] = useState(true);
  const [showReviewed, setShowReviewed] = useState(false);

  const now = new Date();

  const loadMatches = useCallback(async () => {
    if (!currentUser?.id) return;

    const rows = await fetchMatchesForUser(currentUser.id as string);
    const mapped = rows.map(mapMatchRowToMockUser);

    // FIX 2: only append mock *after* real ones, not default state
    setUsers([...mapped, ...MOCK_USERS]);
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
  .filter(u => new Date(u.concertDate) > now)
  .filter(u => u.source !== "mock"); // remove Sarah + Chloe

  const pastUnreviewed = users.filter(
    u => new Date(u.concertDate) <= now && u.review === null
  );
  const pastReviewed = users.filter(
    u => new Date(u.concertDate) <= now && u.review !== null
  );

  const handleSubmitReview = (id: string, review: Review) => {
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, review } : u))
    );
    // Optionally: Update review in Supabase
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: SPACING.xl }}
    >
      <View style={{ height: SPACING.lg }} />
      <Text style={styles.title}>Meet</Text>
      <Text style={styles.subtitle}>Tap a match to review or text them.</Text>

      <Text style={styles.section}>🎟️ Upcoming Matches</Text>
      {futureMatches.map(u => (
        <ConversationListItem
          key={u.id}
          matchedUser={u}
          onSubmitReview={handleSubmitReview}
        />
      ))}

      <View style={styles.dropdownHeader}>
        <Text style={styles.section}>🕓 Past Matches (Unreviewed)</Text>
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
          />
        ))}

      <View style={styles.dropdownHeader}>
        <Text style={styles.section}>✅ Past Matches (Reviewed)</Text>
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
