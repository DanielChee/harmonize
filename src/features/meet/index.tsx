import ConversationListItem from '@components/meet/ConversationListItem';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import { MOCK_USERS, type MockUser, type Review } from '@utils/mockMeets';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MeetScreen() {
  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS);
  const [reviewVersion, setReviewVersion] = useState<'A' | 'B'>('A');
  const [showUnreviewed, setShowUnreviewed] = useState(true);
  const [showReviewed, setShowReviewed] = useState(false);

  const now = new Date();

  const futureMatches = users.filter(u => new Date(u.concertDate) > now);
  const pastUnreviewed = users.filter(u => new Date(u.concertDate) <= now && u.review === null);
  const pastReviewed = users.filter(u => new Date(u.concertDate) <= now && u.review !== null);

  const handleSubmitReview = (id: string, review: Review) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, review } : u)));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: SPACING.xl }}>
      <View style={{ height: SPACING.lg }} />
      <Text style={styles.title}>Meet</Text>
      <Text style={styles.subtitle}>Tap a match to review or text them.</Text>

      <View style={{ alignItems: 'center', marginVertical: SPACING.sm }}>
        <TouchableOpacity
          onPress={() => setReviewVersion(reviewVersion === 'A' ? 'B' : 'A')}
          style={styles.switchButton}
        >
          <Text style={styles.switchText}>Switch to Version {reviewVersion === 'A' ? 'B' : 'A'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.section}>🎟️ Upcoming Matches</Text>
      {futureMatches.map(u => (
        <ConversationListItem key={u.id} matchedUser={u} reviewVersion={reviewVersion} onSubmitReview={handleSubmitReview} />
      ))}

      <TouchableOpacity onPress={() => setShowUnreviewed(!showUnreviewed)} style={styles.dropdownHeader}>
        <Text style={styles.section}>🕓 Past Matches (Unreviewed)</Text>
        <Text style={styles.chevron}>{showUnreviewed ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {showUnreviewed &&
        pastUnreviewed.map(u => (
          <ConversationListItem key={u.id} matchedUser={u} reviewVersion={reviewVersion} onSubmitReview={handleSubmitReview} />
        ))}

      <TouchableOpacity onPress={() => setShowReviewed(!showReviewed)} style={styles.dropdownHeader}>
        <Text style={styles.section}>✅ Past Matches (Reviewed)</Text>
        <Text style={styles.chevron}>{showReviewed ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {showReviewed &&
        pastReviewed.map(u => (
          <ConversationListItem key={u.id} matchedUser={u} reviewVersion={reviewVersion} onSubmitReview={handleSubmitReview} />
        ))}

      <View style={{ height: SPACING.xl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingTop: SPACING.lg },
  title: { fontSize: TYPOGRAPHY.sizes['3xl'], fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary, textAlign: 'center' },
  subtitle: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary, textAlign: 'center', marginBottom: SPACING.md },
  section: { fontSize: TYPOGRAPHY.sizes.lg, color: COLORS.primary, fontWeight: TYPOGRAPHY.weights.semibold, marginLeft: SPACING.lg, marginTop: SPACING.md },
  switchButton: { backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  switchText: { color: COLORS.text.inverse, fontWeight: TYPOGRAPHY.weights.semibold },
  dropdownHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: SPACING.lg },
  chevron: { marginRight: SPACING.xs, color: COLORS.text.secondary, fontSize: TYPOGRAPHY.sizes.base },
});
