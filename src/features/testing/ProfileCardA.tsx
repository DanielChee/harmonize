/**
 * Profile Card A - Amazon-Style Reviews
 * Shows test profiles with text reviews and star ratings
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { TestProfile } from '@types';
import { COLORS, SPACING, BORDER_RADIUS } from '@constants';

interface ProfileCardAProps {
  profile: TestProfile;
}

export function ProfileCardA({ profile }: ProfileCardAProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.name[0]}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.meta}>
            {profile.age} • {profile.pronouns}
          </Text>
        </View>
        {profile.universityVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓</Text>
          </View>
        )}
      </View>

      {/* Bio */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bio}>{profile.bio}</Text>
      </View>

      {/* Info Cards */}
      <View style={styles.section}>
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>University</Text>
            <Text style={styles.infoValue}>{profile.university}</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Concerts</Text>
            <Text style={styles.infoValue}>{profile.concertsAttended}</Text>
          </View>
        </View>
      </View>

      {/* Reviews Section */}
      <View style={styles.section}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>Reviews ({profile.totalReviews})</Text>
          <View style={styles.ratingDisplay}>
            <Text style={styles.ratingNumber}>{profile.averageRatingTypeA.toFixed(1)}</Text>
            <Text style={styles.star}>★</Text>
          </View>
        </View>

        {/* Review List */}
        {profile.reviewsTypeA.map((review, index) => (
          <View key={index} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewerName}>{review.reviewerName}</Text>
              <View style={styles.reviewStars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Text key={i} style={i < review.stars ? styles.starFilled : styles.starEmpty}>
                    ★
                  </Text>
                ))}
              </View>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
            <Text style={styles.reviewDate}>{review.daysAgo} days ago</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  meta: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  verifiedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  section: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  bio: {
    fontSize: 16,
    color: COLORS.text.secondary,
    lineHeight: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  star: {
    fontSize: 20,
    color: '#FFD700',
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  starFilled: {
    fontSize: 14,
    color: '#FFD700',
  },
  starEmpty: {
    fontSize: 14,
    color: COLORS.text.tertiary,
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
});
