import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@constants';
import { useABTestStore } from '@store';
import { MaterialIcons } from '@expo/vector-icons';

// Mock data for sessions since we don't have a real backend for this yet
const MOCK_SESSIONS = [
    { id: 'sess_001', userId: 'user_123', variant: 'A', status: 'active', startTime: Date.now() - 3600000 },
    { id: 'sess_002', userId: 'user_456', variant: 'B', status: 'completed', startTime: Date.now() - 7200000 },
    { id: 'sess_003', userId: 'user_789', variant: 'A', status: 'active', startTime: Date.now() - 1800000 },
];

export function SessionManager() {
    const { variant, setVariant } = useABTestStore();
    const [sessions, setSessions] = useState(MOCK_SESSIONS);

    const toggleVariant = (sessionId: string, currentVariant: string) => {
        const newVariant = currentVariant === 'A' ? 'B' : 'A';

        // Update local state
        setSessions(prev => prev.map(s =>
            s.id === sessionId ? { ...s, variant: newVariant } : s
        ));

        // If it's the current user's session, update the store
        // In a real app, this would update the backend
        if (sessionId === 'sess_001') { // Assuming current user is sess_001 for demo
            setVariant(newVariant as 'A' | 'B');
            Alert.alert('Variant Updated', `Switched to Variant ${newVariant}`);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Active Sessions</Text>
            <FlatList
                data={sessions}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.sessionCard}>
                        <View>
                            <Text style={styles.userId}>User: {item.userId}</Text>
                            <Text style={styles.sessionInfo}>
                                Started: {new Date(item.startTime).toLocaleTimeString()} • Status: {item.status}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.variantBadge,
                                { backgroundColor: item.variant === 'A' ? COLORS.primary : COLORS.secondary }
                            ]}
                            onPress={() => toggleVariant(item.id, item.variant)}
                        >
                            <Text style={styles.variantText}>Variant {item.variant}</Text>
                            <MaterialIcons name="swap-horiz" size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                )}
            />

            <View style={styles.debugSection}>
                <Text style={styles.debugTitle}>Current Device Debug</Text>
                <Text>Current Assigned Variant: {variant}</Text>
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
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
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
        marginBottom: SPACING.sm,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginTop: SPACING.sm,
    },
    debugButton: {
        padding: SPACING.sm,
        backgroundColor: COLORS.text.secondary,
        borderRadius: BORDER_RADIUS.sm,
    },
    activeButton: {
        backgroundColor: COLORS.primary,
    },
    debugButtonText: {
        color: 'white',
        fontSize: 12,
    },
});
