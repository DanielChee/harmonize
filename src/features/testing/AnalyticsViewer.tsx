/**
 * A/B Test Analytics Viewer
 * Displays collected behavioral metrics and allows data export
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@constants';
import { useABTestStore } from '@store';
import type { ProfileInteractionMetrics } from '@types';
import { getAllInteractions, exportABTestData } from '@utils/abTestTracking';
import { getAllProfiles } from '@services/supabase/user';
import { getProfileCreationMetrics, ProfileCreationMetric } from '@services/supabase/analytics';

export function AnalyticsViewer() {
  const { variant, assignment, resetData } = useABTestStore();
  const [allInteractions, setAllInteractions] = useState<ProfileInteractionMetrics[]>([]);
  const [s5Stats, setS5Stats] = useState({ total: 0, manual: 0, spotify: 0 });
  const [creationMetrics, setCreationMetrics] = useState<ProfileCreationMetric[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all interactions on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [interactions, profiles, metrics] = await Promise.all([
        getAllInteractions(),
        getAllProfiles(),
        getProfileCreationMetrics()
      ]);
      
      setAllInteractions(interactions);
      setCreationMetrics(metrics);

      // Calculate Sprint 5 Stats (Profiles)
      const total = profiles.length;
      const manual = profiles.filter(p => p.sprint_5_variant === 'variant_a').length;
      const spotify = profiles.filter(p => p.sprint_5_variant === 'variant_b').length;
      setS5Stats({ total, manual, spotify });

    } catch (error) {
      console.error('Failed to load analytics data:', error);
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
            await loadData();
            Alert.alert('Success', 'All A/B test data has been reset');
          },
        },
      ]
    );
  };

  // Calculate summary statistics for Sprint 4 (Feed)
  const feedStats = {
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

  // Calculate Sprint 5 Metrics (Profile Creation)
  const calculateVariantMetrics = (variant: 'A' | 'B') => {
    const data = creationMetrics.filter(m => m.variant_assigned === variant);
    const count = data.length;
    if (count === 0) return { count: 0, time: 0, edits: 0, satisfaction: 0, accuracy: 0 };

    const avgTime = data.reduce((sum, m) => sum + (m.time_taken_seconds || 0), 0) / count;
    const avgEdits = data.reduce((sum, m) => sum + (m.number_of_edits || 0), 0) / count;
    const satisfactionCount = data.filter(m => m.satisfaction_score).length;
    const avgAccuracy = data.reduce((sum, m) => sum + (m.perceived_accuracy_score || 0), 0) / count; // Note: check if we should filter nulls

    // Only count valid accuracy scores
    const accuracyData = data.filter(m => m.perceived_accuracy_score !== null);
    const validAccuracyAvg = accuracyData.length > 0 
        ? accuracyData.reduce((sum, m) => sum + (m.perceived_accuracy_score || 0), 0) / accuracyData.length 
        : 0;

    return {
      count,
      time: avgTime.toFixed(0),
      edits: avgEdits.toFixed(1),
      satisfaction: ((satisfactionCount / count) * 100).toFixed(0),
      accuracy: validAccuracyAvg.toFixed(1)
    };
  };

  const variantAStats = calculateVariantMetrics('A');
  const variantBStats = calculateVariantMetrics('B');

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>A/B Test Analytics</Text>
        <Text style={styles.subtitle}>
          Active User Variant: {variant || 'Not assigned'}
        </Text>
      </View>

      {/* Sprint 5: Profile Creation Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sprint 5: Profile Creation (Manual vs Spotify)</Text>
        
        <View style={styles.comparisonContainer}>
            {/* Variant A Column */}
            <View style={styles.variantColumn}>
                <Text style={styles.variantTitle}>Variant A (Manual)</Text>
                <Text style={styles.variantSubtitle}>{variantAStats.count} Participants</Text>
                
                <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Time</Text>
                    <Text style={styles.metricValue}>{variantAStats.time}s</Text>
                </View>
                <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Edits</Text>
                    <Text style={styles.metricValue}>{variantAStats.edits}</Text>
                </View>
                <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Satisfaction</Text>
                    <Text style={[styles.metricValue, { color: COLORS.success }]}>{variantAStats.satisfaction}%</Text>
                </View>
                <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Accuracy</Text>
                    <Text style={styles.metricValue}>{variantAStats.accuracy}/5</Text>
                </View>
            </View>

            {/* Divider */}
            <View style={styles.verticalDivider} />

            {/* Variant B Column */}
            <View style={styles.variantColumn}>
                <Text style={styles.variantTitle}>Variant B (Spotify)</Text>
                <Text style={styles.variantSubtitle}>{variantBStats.count} Participants</Text>
                
                <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Time</Text>
                    <Text style={styles.metricValue}>{variantBStats.time}s</Text>
                </View>
                <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Edits</Text>
                    <Text style={styles.metricValue}>{variantBStats.edits}</Text>
                </View>
                <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Satisfaction</Text>
                    <Text style={[styles.metricValue, { color: Number(variantBStats.satisfaction) < 60 ? COLORS.warning : COLORS.success }]}>
                        {variantBStats.satisfaction}%
                    </Text>
                </View>
                <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>Accuracy</Text>
                    <Text style={styles.metricValue}>{variantBStats.accuracy}/5</Text>
                </View>
            </View>
        </View>
      </View>

      {/* Sprint 4: Feed Interactions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sprint 4: Feed Interactions</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{feedStats.totalInteractions}</Text>
            <Text style={styles.statLabel}>Total Interactions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{feedStats.avgTimeSpent}s</Text>
            <Text style={styles.statLabel}>Avg Time Spent</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.likeCard]}>
            <Text style={styles.statValue}>{feedStats.likes}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
          <View style={[styles.statCard, styles.passCard]}>
            <Text style={styles.statValue}>{feedStats.passes}</Text>
            <Text style={styles.statLabel}>Passes</Text>
          </View>
          <View style={[styles.statCard, styles.blockCard]}>
            <Text style={styles.statValue}>{feedStats.blocks}</Text>
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
            {feedStats.positiveProfileInteractions} interactions
          </Text>
        </View>

        <View style={styles.profileTypeCard}>
          <View style={styles.profileTypeHeader}>
            <Text style={styles.profileTypeEmoji}>😐</Text>
            <Text style={styles.profileTypeName}>Neutral Profile</Text>
          </View>
          <Text style={styles.profileTypeCount}>
            {feedStats.neutralProfileInteractions} interactions
          </Text>
        </View>

        <View style={styles.profileTypeCard}>
          <View style={styles.profileTypeHeader}>
            <Text style={styles.profileTypeEmoji}>😟</Text>
            <Text style={styles.profileTypeName}>Negative Profile</Text>
          </View>
          <Text style={styles.profileTypeCount}>
            {feedStats.negativeProfileInteractions} interactions
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.text.secondary,
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
  // Comparison Styles
  comparisonContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  variantColumn: {
    flex: 1,
    alignItems: 'center',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
  variantTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  variantSubtitle: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
    paddingBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
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