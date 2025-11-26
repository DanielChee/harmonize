import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@constants';
import { MaterialIcons } from '@expo/vector-icons';
import { getAllProfiles, deleteProfile, updateUserProfile } from '@services/supabase/user';
import { TEST_PROFILES } from '@utils/testProfiles';
import type { User } from '@types';
import { v4 as uuidv4 } from 'uuid';

export function ProfileManager() {
    const [profiles, setProfiles] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        setIsLoading(true);
        const data = await getAllProfiles();
        setProfiles(data);
        setIsLoading(false);
    };

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            'Delete Profile',
            `Are you sure you want to delete ${name}? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setIsActionLoading(true);
                        const success = await deleteProfile(id);
                        if (success) {
                            setProfiles(prev => prev.filter(p => p.id !== id));
                            Alert.alert('Success', 'Profile deleted');
                        } else {
                            Alert.alert('Error', 'Failed to delete profile');
                        }
                        setIsActionLoading(false);
                    }
                }
            ]
        );
    };

    const handleCreateTestProfile = () => {
        Alert.alert(
            'Create Test Profile',
            'Select a profile template to create:',
            TEST_PROFILES.map(template => ({
                text: `${template.name} (${template.profileType})`,
                onPress: async () => {
                    setIsActionLoading(true);
                    try {
                        const newId = uuidv4();
                        // Map TestProfile to User type (approximate)
                        const newUser: Partial<User> = {
                            id: newId,
                            email: `test_${newId.substring(0, 8)}@example.com`,
                            username: `test_${template.name.split(' ')[0].toLowerCase()}_${newId.substring(0, 4)}`,
                            display_name: template.name,
                            bio: template.bio,
                            pronouns: template.pronouns,
                            age: template.age,
                            city: 'Atlanta', // Default
                            university: template.university,
                            profile_picture_url: 'https://via.placeholder.com/300', // Placeholder
                            is_active: true,
                            profile_complete: true,
                            concert_budget: '$$',
                            concert_seating: 'GA',
                            concert_transportation: 'Rideshare',
                            top_artists: template.top_artists,
                            top_genres: template.top_genres,
                        };

                        await updateUserProfile(newId, newUser);
                        Alert.alert('Success', 'Test profile created');
                        loadProfiles();
                    } catch (error) {
                        console.error(error);
                        Alert.alert('Error', 'Failed to create test profile');
                    } finally {
                        setIsActionLoading(false);
                    }
                }
            })).concat([{ text: 'Cancel', style: 'cancel', onPress: async () => { } } as any])
        );
    };

    const handleToggleAdmin = async (user: User) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        const action = newRole === 'admin' ? 'Promote to Admin' : 'Revoke Admin';

        Alert.alert(
            action,
            `Are you sure you want to ${action.toLowerCase()} for ${user.display_name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setIsActionLoading(true);
                        try {
                            const updatedUser = await updateUserProfile(user.id, { role: newRole });
                            if (updatedUser) {
                                setProfiles(prev => prev.map(p => p.id === user.id ? updatedUser : p));
                                Alert.alert('Success', `User role updated to ${newRole}`);
                            }
                        } catch (error: any) {
                            console.error(error);
                            if (error.message?.includes("Could not find the 'role' column")) {
                                Alert.alert(
                                    'Schema Error',
                                    "The 'role' column is missing in Supabase.\n\nPlease go to your Supabase Dashboard -> Table Editor -> profiles -> Add Column 'role' (text)."
                                );
                            } else {
                                Alert.alert('Error', 'Failed to update user role: ' + (error.message || 'Unknown error'));
                            }
                        } finally {
                            setIsActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: User }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{item.display_name || 'Unnamed User'}</Text>
                        {item.role === 'admin' && (
                            <View style={styles.adminBadge}>
                                <Text style={styles.adminBadgeText}>ADMIN</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.email}>{item.email}</Text>
                    <Text style={styles.id}>ID: {item.id.substring(0, 8)}...</Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity
                        onPress={() => handleToggleAdmin(item)}
                        disabled={isActionLoading}
                        style={styles.iconButton}
                    >
                        <MaterialIcons
                            name={item.role === 'admin' ? "remove-moderator" : "add-moderator"}
                            size={24}
                            color={item.role === 'admin' ? COLORS.warning : COLORS.primary}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDelete(item.id, item.display_name || 'User')}
                        disabled={isActionLoading}
                        style={styles.iconButton}
                    >
                        <MaterialIcons name="delete-outline" size={24} color={COLORS.error} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.cardFooter}>
                <Text style={styles.badge}>{item.profile_complete ? 'Complete' : 'Incomplete'}</Text>
                <Text style={styles.badge}>{item.university || 'No Uni'}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>User Profiles ({profiles.length})</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleCreateTestProfile}
                    disabled={isActionLoading}
                >
                    <MaterialIcons name="add" size={20} color={COLORS.text.inverse} />
                    <Text style={styles.addButtonText}>Add Test User</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={profiles}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshing={isLoading}
                    onRefresh={loadProfiles}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>No profiles found</Text>
                        </View>
                    }
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
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: BORDER_RADIUS.sm,
        gap: 4,
    },
    addButtonText: {
        color: COLORS.text.inverse,
        fontWeight: '600',
        fontSize: 14,
    },
    list: {
        gap: SPACING.md,
    },
    card: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    email: {
        fontSize: 14,
        color: COLORS.text.secondary,
    },
    id: {
        fontSize: 12,
        color: COLORS.text.tertiary,
        marginTop: 2,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    adminBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    adminBadgeText: {
        color: COLORS.text.inverse,
        fontSize: 10,
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconButton: {
        padding: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: SPACING.xs,
    },
    badge: {
        fontSize: 12,
        color: COLORS.text.secondary,
        backgroundColor: COLORS.background,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.xl,
    },
    emptyText: {
        color: COLORS.text.secondary,
    },
});
