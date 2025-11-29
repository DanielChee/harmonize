/**
 * A/B Test Analytics Viewer
 * Displays collected behavioral metrics and allows data export
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@constants';
import { useABTestStore } from '@store';
import type { ProfileInteractionMetrics } from '@types';
import { getAllInteractions, exportABTestData } from '@utils/abTestTracking';

export function AnalyticsViewer() {
  const { variant, assignment, resetData } = useABTestStore();
  const [allInteractions, setAllInteractions] = useState<ProfileInteractionMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all interactions on mount
  useEffect(() => {
    loadInteractions();
  }, []);

  const loadInteractions = async () => {
    try {
      setLoading(true);
      const interactions = await getAllInteractions();
      setAllInteractions(interactions);
    } catch (error) {
      console.error('Failed to load interactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const jsonData = await exportABTestData();
      console.log('Exported A/B Test Data:');
      console.log(jsonData);

      Alert.alert(
        'Data Exported',
        'Check console for JSON data. In production, this would save to a file or send to server.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Export Failed', 'Could not export data. Check console for details.');
      console.error('Export error:', error);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all A/B test data and variant assignments. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetData();
            await loadInteractions();
            Alert.alert('Success', 'All A/B test data has been reset');
          },
        },
      ]
    );
  };

  // Calculate summary statistics
  const stats = {
    totalInteractions: allInteractions.length,
    likes: allInteractions.filter(i => i.decision === 'like').length,
    passes: allInteractions.filter(i => i.decision === 'pass').length,
    blocks: allInteractions.filter(i => i.decision === 'block').length,
    positiveProfileInteractions: allInteractions.filter(i => i.profileType === 'positive').length,
    neutralProfileInteractions: allInteractions.filter(i => i.profileType === 'neutral').length,
    negativeProfileInteractions: allInteractions.filter(i => i.profileType === 'negative').length,
    avgTimeSpent: allInteractions.length > 0
      ? (allInteractions.reduce((sum, i) => sum + (i.timeSpentSeconds || 0), 0) / allInteractions.length).toFixed(1)
      : '0',
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>A/B Test Analytics</Text>
        <Text style={styles.subtitle}>
          Variant: {variant || 'Not assigned'} • User: {assignment?.userId || 'N/A'}
        </Text>
      </View>

      {/* Summary Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalInteractions}</Text>
            <Text style={styles.statLabel}>Total Interactions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.avgTimeSpent}s</Text>
            <Text style={styles.statLabel}>Avg Time Spent</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.likeCard]}>
            <Text style={styles.statValue}>{stats.likes}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
          <View style={[styles.statCard, styles.passCard]}>
            <Text style={styles.statValue}>{stats.passes}</Text>
            <Text style={styles.statLabel}>Passes</Text>
          </View>
          <View style={[styles.statCard, styles.blockCard]}>
            <Text style={styles.statValue}>{stats.blocks}</Text>
            <Text style={styles.statLabel}>Blocks</Text>
          </View>
        </View>
      </View>

      {/* Profile Type Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>By Profile Type</Text>

        <View style={styles.profileTypeCard}>
          <View style={styles.profileTypeHeader}>
            <Text style={styles.profileTypeEmoji}>😊</Text>
            <Text style={styles.profileTypeName}>Positive Profile</Text>
          </View>
          <Text style={styles.profileTypeCount}>
            {stats.positiveProfileInteractions} interactions
          </Text>
        </View>

        <View style={styles.profileTypeCard}>
          <View style={styles.profileTypeHeader}>
            <Text style={styles.profileTypeEmoji}>😐</Text>
            <Text style={styles.profileTypeName}>Neutral Profile</Text>
          </View>
          <Text style={styles.profileTypeCount}>
            {stats.neutralProfileInteractions} interactions
          </Text>
        </View>

        <View style={styles.profileTypeCard}>
          <View style={styles.profileTypeHeader}>
            <Text style={styles.profileTypeEmoji}>😟</Text>
            <Text style={styles.profileTypeName}>Negative Profile</Text>
          </View>
          <Text style={styles.profileTypeCount}>
            {stats.negativeProfileInteractions} interactions
          </Text>
        </View>
      </View>

      {/* Recent Interactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Interactions</Text>

        {allInteractions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No interactions yet</Text>
            <Text style={styles.emptySubtext}>
              Go to the Match tab and swipe on some profiles
            </Text>
          </View>
        ) : (
          allInteractions.slice(-10).reverse().map((interaction, index) => (
            <View key={index} style={styles.interactionCard}>
              <View style={styles.interactionHeader}>
                <Text style={styles.interactionProfile}>
                  {interaction.profileType.charAt(0).toUpperCase() + interaction.profileType.slice(1)} Profile
                </Text>
                <Text style={styles.interactionDecision}>
                  {interaction.decision || 'viewed'}
                </Text>
              </View>
              <Text style={styles.interactionDetails}>
                Time spent: {interaction.timeSpentSeconds?.toFixed(1) || '?'}s •
                Variant: {interaction.variantShown}
              </Text>
              <Text style={styles.interactionTimestamp}>
                {new Date(interaction.timestamp).toLocaleString()}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
          <Text style={styles.exportButtonText}>Export Data (JSON)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset All Data</Text>
        </TouchableOpacity>
      </View>

      {/* Dev Info */}
      <View style={styles.devInfo}>
        <Text style={styles.devInfoText}>
          For researchers: Export data to analyze behavioral differences between variants.
        </Text>
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
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  section: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  likeCard: {
    backgroundColor: COLORS.success + '20',
  },
  passCard: {
    backgroundColor: COLORS.text.secondary + '20',
  },
  blockCard: {
    backgroundColor: COLORS.error + '20',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  profileTypeCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  profileTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  profileTypeEmoji: {
    fontSize: 24,
  },
  profileTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  profileTypeCount: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  interactionCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  interactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  interactionProfile: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  interactionDecision: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  interactionDetails: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  interactionTimestamp: {
    fontSize: 11,
    color: COLORS.text.tertiary,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.text.tertiary,
    textAlign: 'center',
  },
  actionsSection: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  exportButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  exportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  resetButton: {
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  devInfo: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  devInfoText: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
