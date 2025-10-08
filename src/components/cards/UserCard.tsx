// User profile card for discovery and matching

import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '@components/common';
import { COLORS, TYPOGRAPHY, SPACING, VERIFICATION_LABELS } from '@constants';
import type { User } from '@types';

interface UserCardProps {
  user: User;
  onLike?: () => void;
  onPass?: () => void;
  onSuperLike?: () => void;
  onPress?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  onLike,
  onPass,
  onSuperLike,
  onPress,
  showActions = true,
  compact = false,
}) => {
  const verificationBadge = user.verification_level > 0 && (
    <View style={styles.verificationBadge}>
      <MaterialCommunityIcons
        name="check-decagram"
        size={16}
        color={COLORS.success}
      />
      <Text style={styles.verificationText}>
        {VERIFICATION_LABELS[user.verification_level as keyof typeof VERIFICATION_LABELS]}
      </Text>
    </View>
  );

  if (compact) {
    return (
      <Card variant="elevated" padding="sm" onPress={onPress}>
        <View style={styles.compactContainer}>
          <Image
            source={{ uri: user.profile_picture_url || 'https://via.placeholder.com/50' }}
            style={styles.compactAvatar}
          />
          <View style={styles.compactInfo}>
            <Text style={styles.compactName}>{user.display_name || user.username}</Text>
            <Text style={styles.compactDetails}>{user.age} • {user.city}</Text>
          </View>
          {verificationBadge}
        </View>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="xs" onPress={onPress}>
      <View style={styles.container}>
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: user.profile_picture_url || 'https://via.placeholder.com/300x400' }}
            style={styles.profileImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            {verificationBadge}
          </View>
        </View>

        {/* User Info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user.display_name || user.username}</Text>
            <Text style={styles.age}>{user.age}</Text>
          </View>

          {user.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {user.bio}
            </Text>
          )}

          <View style={styles.detailsRow}>
            {user.city && (
              <View style={styles.detail}>
                <MaterialCommunityIcons name="map-marker" size={16} color={COLORS.text.secondary} />
                <Text style={styles.detailText}>{user.city}</Text>
              </View>
            )}
            {user.university && (
              <View style={styles.detail}>
                <MaterialCommunityIcons name="school" size={16} color={COLORS.text.secondary} />
                <Text style={styles.detailText}>{user.university}</Text>
              </View>
            )}
          </View>

          {/* Music Info Placeholder */}
          <View style={styles.musicSection}>
            <MaterialCommunityIcons name="music" size={16} color={COLORS.primary} />
            <Text style={styles.musicText}>Music taste compatible</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {showActions && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.passButton]}
              onPress={onPass}
            >
              <MaterialCommunityIcons name="close" size={24} color={COLORS.error} />
            </TouchableOpacity>

            {onSuperLike && (
              <TouchableOpacity
                style={[styles.actionButton, styles.superLikeButton]}
                onPress={onSuperLike}
              >
                <MaterialCommunityIcons name="star" size={20} color={COLORS.accent} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, styles.likeButton]}
              onPress={onLike}
            >
              <MaterialCommunityIcons name="heart" size={24} color={COLORS.success} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verificationText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.success,
    marginLeft: 2,
  },
  infoContainer: {
    padding: SPACING.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    flex: 1,
  },
  age: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  bio: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  detailText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  musicSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  actionButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passButton: {
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  likeButton: {
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  superLikeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },

  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SPACING.sm,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
  },
  compactDetails: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
});