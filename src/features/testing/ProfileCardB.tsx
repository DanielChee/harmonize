/**
 * Profile Card B - Badge System
 * Shows test profiles with visual badges instead of text reviews
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { TestProfile } from '@types';
import { COLORS, SPACING, BORDER_RADIUS } from '@constants';

interface ProfileCardBProps {
  profile: TestProfile;
}

export function ProfileCardB({ profile }: ProfileCardBProps) {
  const { badgesTypeB } = profile;

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

      {/* Badges Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Badges & Credentials</Text>
        <Text style={styles.subtitle}>Based on {profile.totalReviews} reviews</Text>

        <View style={styles.badgesContainer}>
          {/* Q1 Badge - Event Quality */}
          {badgesTypeB.q1Badge ? (
            <View style={[styles.badgeCard, styles.badgeCardEarned]}>
              <Text style={styles.badgeEmoji}>{badgesTypeB.q1Badge.emoji}</Text>
              <Text style={styles.badgeName}>{badgesTypeB.q1Badge.name}</Text>
              <Text style={styles.badgeCategory}>Event Quality</Text>
            </View>
          ) : (
            <View style={[styles.badgeCard, styles.badgeCardLocked]}>
              <Text style={styles.badgeEmojiLocked}>🔒</Text>
              <Text style={styles.badgeNameLocked}>Not Yet Earned</Text>
              <Text style={styles.badgeCategory}>Event Quality</Text>
            </View>
          )}

          {/* Q2 Badge - Social Compatibility */}
          {badgesTypeB.q2Badge ? (
            <View style={[styles.badgeCard, styles.badgeCardEarned]}>
              <Text style={styles.badgeEmoji}>{badgesTypeB.q2Badge.emoji}</Text>
              <Text style={styles.badgeName}>{badgesTypeB.q2Badge.name}</Text>
              <Text style={styles.badgeCategory}>Social Vibe</Text>
            </View>
          ) : (
            <View style={[styles.badgeCard, styles.badgeCardLocked]}>
              <Text style={styles.badgeEmojiLocked}>🔒</Text>
              <Text style={styles.badgeNameLocked}>Not Yet Earned</Text>
              <Text style={styles.badgeCategory}>Social Vibe</Text>
            </View>
          )}

          {/* Q3 Badge - Reliability */}
          {badgesTypeB.q3Badge ? (
            <View style={[styles.badgeCard, styles.badgeCardEarned]}>
              <Text style={styles.badgeEmoji}>{badgesTypeB.q3Badge.emoji}</Text>
              <Text style={styles.badgeName}>{badgesTypeB.q3Badge.name}</Text>
              <Text style={styles.badgeCategory}>Reliability</Text>
            </View>
          ) : (
            <View style={[styles.badgeCard, styles.badgeCardLocked]}>
              <Text style={styles.badgeEmojiLocked}>🔒</Text>
              <Text style={styles.badgeNameLocked}>Not Yet Earned</Text>
              <Text style={styles.badgeCategory}>Reliability</Text>
            </View>
          )}

          {/* Harmonies Counter */}
          <View style={[styles.badgeCard, badgesTypeB.harmonies.count > 0 ? styles.badgeCardEarned : styles.badgeCardLocked]}>
            <Text style={badgesTypeB.harmonies.count > 0 ? styles.badgeEmoji : styles.badgeEmojiLocked}>
              {badgesTypeB.harmonies.count > 0 ? '🤝' : '🔒'}
            </Text>
            <Text style={badgesTypeB.harmonies.count > 0 ? styles.badgeName : styles.badgeNameLocked}>
              {badgesTypeB.harmonies.count > 0 ? `${badgesTypeB.harmonies.count} Harmonies` : 'No Harmonies Yet'}
            </Text>
            <Text style={styles.badgeCategory}>Would Meet Again</Text>
          </View>
        </View>
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
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: SPACING.lg,
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
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  badgeCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  badgeCardEarned: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  badgeCardLocked: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    opacity: 0.6,
  },
  badgeEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  badgeEmojiLocked: {
    fontSize: 36,
    marginBottom: SPACING.sm,
    opacity: 0.4,
  },
  badgeName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  badgeNameLocked: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  badgeCategory: {
    fontSize: 11,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
