import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@constants';
import { useABTestStore } from '@store';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@services/supabase/supabase';

export function SessionManager() {
    const { variant, setVariant } = useABTestStore();
    const [sessions, setSessions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setIsLoading(true);
        try {
            // Ideally we'd have a sessions table, but for now we'll query recent AB test assignments
            // This serves as a proxy for "active sessions" in this context
            const { data, error } = await supabase
                .from('ab_test_assignments')
                .select('*')
                .order('assigned_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setSessions(data || []);
        } catch (error) {
            console.error('Error fetching sessions:', error);
            Alert.alert('Error', 'Failed to fetch sessions');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleVariant = async (assignmentId: string, currentVariant: string, userId: string) => {
        const newVariant = currentVariant === 'A' ? 'B' : 'A';

        try {
            // Optimistic update
            setSessions(prev => prev.map(s =>
                s.id === assignmentId ? { ...s, assigned_variant: newVariant } : s
            ));

            const { error } = await supabase
                .from('ab_test_assignments')
                .update({ assigned_variant: newVariant })
                .eq('id', assignmentId);

            if (error) throw error;

            // If it's the current user's session/assignment, update the store
            // We check against the store's userId if available, or just if it matches the current device
            // For now, we'll just alert if it was successful. 
            // In a real app, we'd check if (userId === currentUser.id) setVariant(newVariant);
            
        } catch (error) {
            console.error('Error updating variant:', error);
            Alert.alert('Error', 'Failed to update variant');
            fetchSessions(); // Revert on error
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
                <FlatList
                    data={sessions}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.sessionCard}>
                            <View>
                                <Text style={styles.userId}>User: {item.user_id.substring(0, 8)}...</Text>
                                <Text style={styles.sessionInfo}>
                                    Assigned: {new Date(item.assigned_at).toLocaleDateString()}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={[
                                    styles.variantBadge,
                                    { backgroundColor: item.assigned_variant === 'A' ? COLORS.primary : COLORS.secondary }
                                ]}
                                onPress={() => toggleVariant(item.id, item.assigned_variant, item.user_id)}
                            >
                                <Text style={styles.variantText}>Variant {item.assigned_variant}</Text>
                                <MaterialIcons name="swap-horiz" size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.emptyText}>No active assignments found.</Text>}
                />
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