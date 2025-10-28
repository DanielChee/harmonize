import { ConcertCard } from '@components/concerts/ConcertCard';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import type { MockConcert } from '@utils/mockConcerts';
import { MOCK_CONCERTS } from '@utils/mockConcerts';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ConcertsScreen() {
  const [concerts, setConcerts] = useState<MockConcert[]>(MOCK_CONCERTS);

  const handleSaveToggle = (concertId: string) => {
    setConcerts((prev) =>
      prev.map((concert) =>
        concert.id === concertId
          ? { ...concert, isSaved: !concert.isSaved }
          : concert
      )
    );
  };

  const handleConcertPress = (concert: MockConcert) => {
    // TODO: Navigate to concert details screen
    console.log('Concert pressed:', concert.artist);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={{padding: 15 }}></View>
      <View style={styles.header}>
        <Text style={styles.title}>Concerts</Text>
        <Text style={styles.subtitle}>
          Explore upcoming events to buy or offer yours at a bargain!
        </Text>
      </View>

      {/* Filter Tabs (placeholder) */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterTab, styles.filterTabActive]}>
          <Text style={styles.filterTabTextActive}>For You</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterTab}>
          <Text style={styles.filterTabText}>Nearby</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterTab}>
          <Text style={styles.filterTabText}>Saved</Text>
        </TouchableOpacity>
      </View>

      {/* Concert List */}
      <View style={styles.concertList}>
        {concerts.map((concert) => (
          <ConcertCard
            key={concert.id}
            concert={concert}
            onPress={() => handleConcertPress(concert)}
            onSaveToggle={() => handleSaveToggle(concert.id)}
          />
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
  contentContainer: {
    paddingBottom: SPACING.xl,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  filterTabTextActive: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.inverse,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  concertList: {
    paddingHorizontal: SPACING.lg,
  },
});
