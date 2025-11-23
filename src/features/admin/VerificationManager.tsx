import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@constants';
import { MaterialIcons } from '@expo/vector-icons';

// Mock data for verifications
const MOCK_VERIFICATIONS = [
    { id: 'ver_001', userId: 'user_999', email: 'student@gatech.edu', status: 'pending', timestamp: Date.now() - 100000 },
    { id: 'ver_002', userId: 'user_888', email: 'student@emory.edu', status: 'pending', timestamp: Date.now() - 500000 },
];

export function VerificationManager() {
    const [verifications, setVerifications] = useState(MOCK_VERIFICATIONS);

    const handleAction = (id: string, action: 'approve' | 'reject') => {
        Alert.alert(
            `Confirm ${action}`,
            `Are you sure you want to ${action} this request?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => {
                        setVerifications(prev => prev.filter(v => v.id !== id));
                        Alert.alert('Success', `Request ${action}d`);
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Pending Verifications ({verifications.length})</Text>

            {verifications.length === 0 ? (
                <View style={styles.emptyState}>
                    <MaterialIcons name="check-circle" size={48} color={COLORS.success} />
                    <Text style={styles.emptyText}>All caught up!</Text>
                </View>
            ) : (
                <FlatList
                    data={verifications}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.header}>
                                <Text style={styles.email}>{item.email}</Text>
                                <Text style={styles.time}>{new Date(item.timestamp).toLocaleDateString()}</Text>
                            </View>

                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={[styles.button, styles.rejectButton]}
                                    onPress={() => handleAction(item.id, 'reject')}
                                >
                                    <MaterialIcons name="close" size={20} color={COLORS.error} />
                                    <Text style={[styles.buttonText, { color: COLORS.error }]}>Reject</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, styles.approveButton]}
                                    onPress={() => handleAction(item.id, 'approve')}
                                >
                                    <MaterialIcons name="check" size={20} color="white" />
                                    <Text style={[styles.buttonText, { color: 'white' }]}>Approve</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}
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
    card: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    header: {
        marginBottom: SPACING.md,
    },
    email: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    time: {
        fontSize: 12,
        color: COLORS.text.secondary,
    },
    actions: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.sm,
        borderRadius: BORDER_RADIUS.sm,
        gap: 4,
    },
    approveButton: {
        backgroundColor: COLORS.success,
    },
    rejectButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: COLORS.error,
    },
    buttonText: {
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    emptyText: {
        marginTop: SPACING.md,
        color: COLORS.text.secondary,
    },
});
