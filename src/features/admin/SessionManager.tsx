import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@constants';
import { useABTestStore } from '@store';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@services/supabase/supabase';
import { SecureStoreAdapter } from '../../lib/secureStore';

const STORAGE_KEY = "harmonize_daily_likes";

export function SessionManager() {
    const { variant, setVariant } = useABTestStore();
    const [sprint4Sessions, setSprint4Sessions] = useState<any[]>([]);
    const [sprint5Sessions, setSprint5Sessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const resetLikeLimit = async () => {
        try {
            await SecureStoreAdapter.removeItem(STORAGE_KEY);
            Alert.alert("Success", "Daily like limit reset to 0.");
        } catch (error) {
            Alert.alert("Error", "Failed to reset like limit.");
        }
    };

    const fetchSessions = async () => {
        setIsLoading(true);
        try {
            // Sprint 4: Review System (A/B Test Assignments)
            const { data: s4Data, error: s4Error } = await supabase
                .from('ab_test_assignments')
                .select('*')
                .order('assigned_at', { ascending: false })
                .limit(20);

            if (s4Error) throw s4Error;
            setSprint4Sessions(s4Data || []);

            // Sprint 5: Profile Creation (Profiles table)
            const { data: s5Data, error: s5Error } = await supabase
                .from('profiles')
                .select('id, username, display_name, sprint_5_variant, created_at')
                .not('sprint_5_variant', 'is', null)
                .order('created_at', { ascending: false })
                .limit(20);

            if (s5Error) throw s5Error;
            setSprint5Sessions(s5Data || []);

        } catch (error) {
            console.error('Error fetching sessions:', error);
            Alert.alert('Error', 'Failed to fetch sessions');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleVariantS4 = async (assignmentId: string, currentVariant: string) => {
        const newVariant = currentVariant === 'A' ? 'B' : 'A';
        try {
            setSprint4Sessions(prev => prev.map(s => s.id === assignmentId ? { ...s, assigned_variant: newVariant } : s));
            const { error } = await supabase.from('ab_test_assignments').update({ assigned_variant: newVariant }).eq('id', assignmentId);
            if (error) throw error;
        } catch (error) {
            console.error(error);
            fetchSessions();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>User Assignments</Text>
                <TouchableOpacity onPress={fetchSessions} disabled={isLoading}>
                    <MaterialIcons name="refresh" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
                <ScrollView style={{ flex: 1 }}>
                    {/* Sprint 5 Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sprint 5: Profile Creation (Manual vs Spotify)</Text>
                        {sprint5Sessions.length === 0 ? (
                            <Text style={styles.emptyText}>No Sprint 5 sessions found.</Text>
                        ) : (
                            sprint5Sessions.map(item => (
                                <View key={item.id} style={styles.sessionCard}>
                                    <View>
                                        <Text style={styles.userId}>{item.display_name || 'User'}</Text>
                                        <Text style={styles.sessionInfo}>ID: {item.id.substring(0, 8)}...</Text>
                                    </View>
                                    <View style={[
                                        styles.variantBadge,
                                        { backgroundColor: item.sprint_5_variant === 'variant_b' ? '#1DB954' : COLORS.text.secondary }
                                    ]}>
                                        <Text style={styles.variantText}>
                                            {item.sprint_5_variant === 'variant_b' ? 'Spotify (B)' : 'Manual (A)'}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>

                    {/* Sprint 4 Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sprint 4: Review System (Text vs Badge)</Text>
                        {sprint4Sessions.length === 0 ? (
                            <Text style={styles.emptyText}>No Sprint 4 sessions found.</Text>
                        ) : (
                            sprint4Sessions.map(item => (
                                <View key={item.id} style={styles.sessionCard}>
                                    <View>
                                        <Text style={styles.userId}>User: {item.user_id.substring(0, 8)}...</Text>
                                        <Text style={styles.sessionInfo}>
                                            {new Date(item.assigned_at).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={[
                                            styles.variantBadge,
                                            { backgroundColor: item.assigned_variant === 'A' ? COLORS.primary : COLORS.secondary }
                                        ]}
                                        onPress={() => toggleVariantS4(item.id, item.assigned_variant)}
                                    >
                                        <Text style={styles.variantText}>Variant {item.assigned_variant}</Text>
                                        <MaterialIcons name="swap-horiz" size={16} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            )}

            <View style={styles.debugSection}>
                <Text style={styles.debugTitle}>Device Controls (Feature Flags)</Text>
                <Text style={styles.debugSubtitle}>Force variant on this device only:</Text>
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.debugButton, variant === 'A' && styles.activeButton]}
                        onPress={() => setVariant('A')}
                    >
                        <Text style={styles.debugButtonText}>Force Variant A</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.debugButton, variant === 'B' && styles.activeButton]}
                        onPress={() => setVariant('B')}
                    >
                        <Text style={styles.debugButtonText}>Force Variant B</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.debugButton, { marginTop: SPACING.md, backgroundColor: COLORS.error }]}
                    onPress={resetLikeLimit}
                >
                    <Text style={styles.debugButtonText}>Reset My Daily Like Limit</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text.primary,
    },
    section: {
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        marginBottom: SPACING.sm,
    },
    sessionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    userId: {
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    sessionInfo: {
        fontSize: 12,
        color: COLORS.text.secondary,
        marginTop: 2,
    },
    variantBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        gap: 4,
    },
    variantText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    debugSection: {
        marginTop: SPACING.xl,
        padding: SPACING.md,
        backgroundColor: '#f0f0f0',
        borderRadius: BORDER_RADIUS.md,
    },
    debugTitle: {
        fontWeight: 'bold',
        marginBottom: SPACING.xs,
    },
    debugSubtitle: {
        fontSize: 12,
        color: COLORS.text.secondary,
        marginBottom: SPACING.sm,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    debugButton: {
        padding: SPACING.sm,
        backgroundColor: COLORS.text.secondary,
        borderRadius: BORDER_RADIUS.sm,
        flex: 1,
        alignItems: 'center',
    },
    activeButton: {
        backgroundColor: COLORS.primary,
    },
    debugButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.text.secondary,
        marginTop: SPACING.xl,
    },
});