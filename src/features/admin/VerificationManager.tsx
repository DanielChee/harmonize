import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@constants';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '@services/supabase/supabase';

// Interface for Verification Request based on typical Supabase data
interface VerificationRequest {
    id: string;
    user_id: string;
    verification_type: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
    metadata?: any; // For flexible data storage
    user?: { email: string }; // Joined user data
}

export function VerificationManager() {
    const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchVerifications();
    }, []);

    const fetchVerifications = async () => {
        setIsLoading(true);
        try {
            // Fetch pending verifications. Assuming a 'verifications' table exists.
            // If not, we might query profiles where verification is pending if modeled that way.
            // For this implementation, we'll assume a separate table for cleaner request management.
            const { data, error } = await supabase
                .from('verifications') // Ensure this table exists or use profiles with a filter
                .select('*, user:profiles(email)') // Join with profiles to get email if possible
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) {
                // Fallback for if the table doesn't exist yet (graceful degradation)
                console.warn('Verifications table might be missing, falling back to mock for demo purposes or empty.', error.message);
                setVerifications([]); 
            } else {
                setVerifications(data || []);
            }
        } catch (error) {
            console.error('Error fetching verifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        Alert.alert(
            `Confirm ${action}`,
            `Are you sure you want to ${action} this request?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        // Optimistic update
                        setVerifications(prev => prev.filter(v => v.id !== id));

                        try {
                            const status = action === 'approve' ? 'approved' : 'rejected';
                            const { error } = await supabase
                                .from('verifications')
                                .update({ status, updated_at: new Date().toISOString() })
                                .eq('id', id);

                            if (error) throw error;
                            
                            // If approved, we might also want to update the user's profile
                            if (action === 'approve') {
                                const request = verifications.find(v => v.id === id);
                                if (request) {
                                     await supabase.from('profiles').update({ is_verified: true }).eq('id', request.user_id);
                                }
                            }

                            Alert.alert('Success', `Request ${action}d`);
                        } catch (error) {
                            console.error(`Error ${action}ing verification:`, error);
                            Alert.alert('Error', `Failed to ${action} request.`);
                            fetchVerifications(); // Revert state
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Pending Verifications</Text>
                <TouchableOpacity onPress={fetchVerifications} disabled={isLoading}>
                    <MaterialIcons name="refresh" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
            ) : verifications.length === 0 ? (
                <View style={styles.emptyState}>
                    <MaterialIcons name="check-circle" size={48} color={COLORS.success} />
                    <Text style={styles.emptyText}>All caught up!</Text>
                    <Text style={styles.subEmptyText}>No pending verification requests.</Text>
                </View>
            ) : (
                <FlatList
                    data={verifications}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.email}>{item.user?.email || `User: ${item.user_id.substring(0, 8)}...`}</Text>
                                <Text style={styles.typeBadge}>{item.verification_type || 'General'}</Text>
                            </View>
                            <Text style={styles.time}>{new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}</Text>

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
    card: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    typeBadge: {
        fontSize: 10,
        color: COLORS.text.secondary,
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        overflow: 'hidden',
    },
    time: {
        fontSize: 12,
        color: COLORS.text.secondary,
        marginBottom: SPACING.md,
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
        marginTop: SPACING.xl,
    },
    emptyText: {
        marginTop: SPACING.md,
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    subEmptyText: {
        color: COLORS.text.secondary,
        marginTop: 4,
    },
});