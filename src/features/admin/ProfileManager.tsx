import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@constants';
import { MaterialIcons } from '@expo/vector-icons';
import { getAllProfiles, deleteProfile, updateUserProfile } from '@services/supabase/user';
import { syncUserImagesFromSpotify } from '@services/spotify/admin';
import { searchSpotifyArtistsPublic, searchSpotifyTracksPublic } from '@services/spotify/client-credentials';
import { TEST_PROFILES } from '@utils/testProfiles';
import type { User } from '@types';
import { v4 as uuidv4 } from 'uuid';

export function ProfileManager() {
    const [profiles, setProfiles] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    
    // Editing State
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    
    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'artist' | 'track'>('artist');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Form State
    const [editForm, setEditForm] = useState({
        display_name: '',
        bio: '',
        university: '',
        profile_picture_url: '',
        top_artists: '', // Comma separated
        top_songs: '',   // Comma separated
        artist_images: '', // Comma separated
        song_images: '',   // Comma separated
    });

    useEffect(() => {
        loadProfiles();
    }, []);

    const handleSearch = async (text: string) => {
        setSearchQuery(text);
        if (text.length < 3) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            if (searchType === 'artist') {
                const results = await searchSpotifyArtistsPublic(text, 5);
                setSearchResults(results);
            } else {
                const results = await searchSpotifyTracksPublic(text, 5);
                setSearchResults(results);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const addSearchResult = async (item: any) => {
        if (!editingUser) return;
        
        try {
            // Get best image (Spotify specific structure)
            const imageUrl = searchType === 'artist' 
                ? (item.images?.[0]?.url || '') 
                : (item.album?.images?.[0]?.url || '');

            if (!imageUrl) {
                Alert.alert('Error', 'No image found for this item.');
                return;
            }

            // Directly use Spotify URL (No upload needed)
            if (searchType === 'artist') {
                const currentArtists = editForm.top_artists ? editForm.top_artists.split(',').map(s => s.trim()).filter(Boolean) : [];
                const currentImages = editForm.artist_images ? editForm.artist_images.split(',').map(s => s.trim()).filter(Boolean) : [];
                
                setEditForm(prev => ({
                    ...prev,
                    top_artists: [...currentArtists, item.name].join(', '),
                    artist_images: [...currentImages, imageUrl].join(', '),
                }));
            } else {
                const artistName = item.artists?.[0]?.name || 'Unknown';
                const name = `${item.name} - ${artistName}`;
                const currentSongs = editForm.top_songs ? editForm.top_songs.split(',').map(s => s.trim()).filter(Boolean) : [];
                const currentImages = editForm.song_images ? editForm.song_images.split(',').map(s => s.trim()).filter(Boolean) : [];
                
                setEditForm(prev => ({
                    ...prev,
                    top_songs: [...currentSongs, name].join(', '),
                    song_images: [...currentImages, imageUrl].join(', '),
                }));
            }
            
            setSearchQuery('');
            setSearchResults([]);

        } catch (error: any) {
            Alert.alert('Error', 'Failed to add item: ' + error.message);
        }
    };

    const loadProfiles = async () => {
        setIsLoading(true);
        const data = await getAllProfiles();
        setProfiles(data);
        setIsLoading(false);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setEditForm({
            display_name: user.display_name || '',
            bio: user.bio || '',
            university: user.university || '',
            profile_picture_url: user.profile_picture_url || '',
            top_artists: (user.top_artists || []).join(', '),
            top_songs: (user.top_songs || []).join(', '),
            artist_images: (user.artist_images || []).join(', '),
            song_images: (user.song_images || []).join(', '),
        });
        setIsModalVisible(true);
    };

    const saveProfile = async () => {
        if (!editingUser) return;

        setIsActionLoading(true);
        try {
            const cleanList = (str: string) => str.split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);

            const updates: Partial<User> = {
                display_name: editForm.display_name,
                bio: editForm.bio,
                university: editForm.university,
                profile_picture_url: editForm.profile_picture_url,
                top_artists: editForm.top_artists.split(',').map(s => s.trim()).filter(Boolean),
                top_songs: editForm.top_songs.split(',').map(s => s.trim()).filter(Boolean),
                artist_images: cleanList(editForm.artist_images),
                song_images: cleanList(editForm.song_images),
            };

            const updatedUser = await updateUserProfile(editingUser.id, updates);
            if (updatedUser) {
                setProfiles(prev => prev.map(p => p.id === editingUser.id ? updatedUser : p));
                Alert.alert('Success', 'Profile updated');
                setIsModalVisible(false);
                setEditingUser(null);
            }
        } catch (error: any) {
            Alert.alert('Error', 'Failed to update profile: ' + error.message);
        } finally {
            setIsActionLoading(false);
        }
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

    const handleSyncImages = async (user: User) => {
        Alert.alert(
            'Sync Images from Spotify',
            `This will fetch images for ${user.display_name}'s top artists and songs using your admin Spotify token. Proceed?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sync',
                    onPress: async () => {
                        setIsActionLoading(true);
                        try {
                            // 1. Fetch and upload images
                            const { artist_images, song_images } = await syncUserImagesFromSpotify(user);
                            console.log('[Admin] Synced images:', { artist_images, song_images });
                            
                            // 2. Update user profile with new URLs
                            const updatedUser = await updateUserProfile(user.id, {
                                artist_images,
                                song_images,
                                sprint_5_variant: 'variant_b' // Mark as having Spotify data structure
                            });

                            if (updatedUser) {
                                setProfiles(prev => prev.map(p => p.id === user.id ? updatedUser : p));
                                Alert.alert('Success', 'Images synced and profile updated.');
                            }
                        } catch (error: any) {
                            console.error('Sync failed:', error);
                            Alert.alert('Error', 'Failed to sync images: ' + error.message);
                        } finally {
                            setIsActionLoading(false);
                        }
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
                        onPress={() => handleSyncImages(item)}
                        disabled={isActionLoading}
                        style={styles.iconButton}
                    >
                        <MaterialIcons name="sync" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleEdit(item)}
                        disabled={isActionLoading}
                        style={styles.iconButton}
                    >
                        <MaterialIcons name="edit" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
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

            {/* Edit Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                                <MaterialIcons name="close" size={24} color={COLORS.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm}>
                                <View style={styles.searchSection}>
                                    <Text style={styles.sectionTitle}>Add Music from Spotify</Text>
                                    <View style={styles.searchTypeRow}>
                                        <TouchableOpacity
                                            style={[styles.typeButton, searchType === 'artist' && styles.typeButtonActive]}
                                            onPress={() => setSearchType('artist')}
                                        >
                                            <Text style={[styles.typeButtonText, searchType === 'artist' && styles.typeButtonTextActive]}>Artists</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.typeButton, searchType === 'track' && styles.typeButtonActive]}
                                            onPress={() => setSearchType('track')}
                                        >
                                            <Text style={[styles.typeButtonText, searchType === 'track' && styles.typeButtonTextActive]}>Songs</Text>
                                        </TouchableOpacity>
                                    </View>
                                    
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder={`Search ${searchType}s...`}
                                        value={searchQuery}
                                        onChangeText={handleSearch}
                                    />
                                    
                                    {(isSearching) && <ActivityIndicator size="small" color={COLORS.primary} />}
                                    
                                    {searchResults.length > 0 && (
                                        <View style={styles.resultsList}>
                                            {searchResults.map((item) => (
                                                <TouchableOpacity
                                                    key={item.id}
                                                    style={styles.resultItem}
                                                    onPress={() => addSearchResult(item)}
                                                >
                                                    <Text style={styles.resultText}>{item.name}</Text>
                                                    <MaterialIcons name="add-circle" size={20} color={COLORS.primary} />
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Display Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editForm.display_name}
                                    onChangeText={(t) => setEditForm(prev => ({ ...prev, display_name: t }))}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Bio</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={editForm.bio}
                                    onChangeText={(t) => setEditForm(prev => ({ ...prev, bio: t }))}
                                    multiline
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>University</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editForm.university}
                                    onChangeText={(t) => setEditForm(prev => ({ ...prev, university: t }))}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Profile Picture URL</Text>
                                <TextInput
                                    style={styles.input}
                                    value={editForm.profile_picture_url}
                                    onChangeText={(t) => setEditForm(prev => ({ ...prev, profile_picture_url: t }))}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Top Artists (comma separated)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={editForm.top_artists}
                                    onChangeText={(t) => setEditForm(prev => ({ ...prev, top_artists: t }))}
                                    multiline
                                    placeholder="Artist 1, Artist 2, Artist 3"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Artist Images (comma separated URLs)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={editForm.artist_images}
                                    onChangeText={(t) => setEditForm(prev => ({ ...prev, artist_images: t }))}
                                    multiline
                                    placeholder="http://url1.jpg, http://url2.jpg"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Top Songs (comma separated)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={editForm.top_songs}
                                    onChangeText={(t) => setEditForm(prev => ({ ...prev, top_songs: t }))}
                                    multiline
                                    placeholder="Song 1 - Artist, Song 2 - Artist"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Song Images (comma separated URLs)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={editForm.song_images}
                                    onChangeText={(t) => setEditForm(prev => ({ ...prev, song_images: t }))}
                                    multiline
                                    placeholder="http://url1.jpg, http://url2.jpg"
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={saveProfile}
                                disabled={isActionLoading}
                            >
                                {isActionLoading ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
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
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: BORDER_RADIUS.lg,
        borderTopRightRadius: BORDER_RADIUS.lg,
        height: '80%',
        padding: SPACING.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text.primary,
    },
    modalForm: {
        flex: 1,
    },
    formGroup: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text.secondary,
        marginBottom: SPACING.xs,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.sm,
        padding: SPACING.md,
        fontSize: 16,
        color: COLORS.text.primary,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalFooter: {
        flexDirection: 'row',
        gap: SPACING.md,
        paddingTop: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    modalButton: {
        flex: 1,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.md,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    saveButton: {
        backgroundColor: COLORS.primary,
    },
    cancelButtonText: {
        fontWeight: '600',
        color: COLORS.text.primary,
    },
    saveButtonText: {
        fontWeight: '600',
        color: COLORS.text.inverse,
    },
    searchSection: {
        marginBottom: SPACING.lg,
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
        color: COLORS.text.primary,
    },
    searchTypeRow: {
        flexDirection: 'row',
        marginBottom: SPACING.md,
        gap: SPACING.md,
    },
    typeButton: {
        flex: 1,
        padding: SPACING.sm,
        alignItems: 'center',
        borderRadius: BORDER_RADIUS.sm,
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    typeButtonActive: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    typeButtonText: {
        color: COLORS.text.secondary,
        fontWeight: '600',
    },
    typeButtonTextActive: {
        color: COLORS.text.inverse,
    },
    searchInput: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.sm,
        padding: SPACING.md,
        fontSize: 16,
        color: COLORS.text.primary,
        marginBottom: SPACING.sm,
    },
    resultsList: {
        maxHeight: 150,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: BORDER_RADIUS.sm,
        backgroundColor: COLORS.background,
    },
    resultItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    resultText: {
        color: COLORS.text.primary,
        flex: 1,
    },
});
