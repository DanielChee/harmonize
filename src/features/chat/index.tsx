import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { ConversationListItem } from '@components/chat';
import { MOCK_CONVERSATIONS } from '@utils/mockChats';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import type { MockConversation } from '@utils/mockChats';

export default function ChatScreen() {
  const handleConversationPress = (conversation: MockConversation) => {
    // TODO: Navigate to conversation detail screen
    console.log('Conversation pressed:', conversation.matchedUser.name);
  };

  const renderConversation = ({ item }: { item: MockConversation }) => (
    <ConversationListItem
      conversation={item}
      onPress={() => handleConversationPress(item)}
    />
  );

  const renderNewMatchHeader = () => {
    const newMatches = MOCK_CONVERSATIONS.filter((c) => c.isNewMatch);
    if (newMatches.length === 0) return null;

    return (
      <View style={styles.newMatchSection}>
        <Text style={styles.newMatchTitle}>New Matches</Text>
        <Text style={styles.newMatchSubtitle}>
          {newMatches.length} {newMatches.length === 1 ? 'person' : 'people'} matched with you!
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
        <Text style={styles.subtitle}>
          DM people that you match with to discuss concert plans.
        </Text>
      </View>

      {/* Conversations List */}
      <FlatList
        data={MOCK_CONVERSATIONS}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderNewMatchHeader}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
  },
  newMatchSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.primary + '10', // 10% opacity
  },
  newMatchTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
    marginBottom: 2,
  },
  newMatchSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.surface,
    marginLeft: SPACING.lg + 56 + SPACING.md, // Align with text
  },
});
