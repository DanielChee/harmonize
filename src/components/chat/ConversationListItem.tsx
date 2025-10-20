// ConversationListItem - Chat list item component
// Shows user avatar, name, last message, and unread count

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import type { MockConversation } from '@utils/mockChats';

interface ConversationListItemProps {
  conversation: MockConversation;
  onPress?: () => void;
}

export const ConversationListItem: React.FC<ConversationListItemProps> = ({
  conversation,
  onPress,
}) => {
  const hasUnread = conversation.unreadCount > 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* User Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: conversation.matchedUser.avatar }}
          style={styles.avatar}
        />
        {conversation.isNewMatch && (
          <View style={styles.newMatchBadge}>
            <MaterialIcons name="star" size={12} color={COLORS.text.inverse} />
          </View>
        )}
      </View>

      {/* Message Info */}
      <View style={styles.messageInfo}>
        <View style={styles.headerRow}>
          <Text style={[styles.userName, hasUnread && styles.textBold]}>
            {conversation.matchedUser.name}
          </Text>
          <Text style={styles.timeText}>{conversation.lastMessageTime}</Text>
        </View>

        {/* Concert Info (if applicable) */}
        {conversation.concert && (
          <Text style={styles.concertText}>
            {conversation.concert.artist} • {conversation.concert.date}
          </Text>
        )}

        {/* Last Message */}
        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              hasUnread && styles.textBold,
            ]}
            numberOfLines={1}
          >
            {conversation.lastMessage}
          </Text>
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{conversation.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surface,
  },
  newMatchBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  messageInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  timeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
  concertText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.primary,
    marginBottom: 2,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginRight: SPACING.sm,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.inverse,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  textBold: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
});
