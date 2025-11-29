import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS, SPACING } from '@constants';
import { Button } from '@components';
import { MusicTasteStep } from '@features/profile-setup/MusicTasteStep';
import { useUserStore } from '@store';
import { updateUserProfile, getUserProfile } from '@services/supabase/user';

export default function EditMusicScreen() {
    const router = useRouter();
    const { session } = useUserStore();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        top_genres: [] as string[],
        top_artists: [] as string[],
        top_songs: [] as string[],
        artist_images: [] as { name: string; url: string }[],
        song_images: [] as { name: string; url: string }[],
        sprint_5_variant: undefined as 'variant_a' | 'variant_b' | undefined,
    });

    const loadData = useCallback(async () => {
        try {
            const profile = await getUserProfile(session?.user?.id || '');
            if (profile) {
                setFormData({
                    top_genres: profile.top_genres || [],
                    top_artists: profile.top_artists || [],
                    top_songs: profile.top_songs || [],
                    artist_images: (profile.top_artists && profile.artist_images)
                        ? profile.top_artists.map((name, i) => ({
                            name,
                            url: profile.artist_images![i] || ''
                        }))
                        : [],
                    song_images: (profile.top_songs && profile.song_images)
                        ? profile.top_songs.map((name, i) => ({
                            name,
                            url: profile.song_images![i] || ''
                        }))
                        : [],
                    sprint_5_variant: profile.sprint_5_variant,
                });
            }
        } catch (error) {
            console.error('Error loading music preferences:', error);
        }
    }, [session?.user?.id, setFormData]); // Add dependencies for useCallback

    useEffect(() => {
        loadData();
    }, [loadData]); // Add loadData to useEffect dependency array

    const updateFormData = (updates: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleSave = async () => {
        if (!session?.user) return;

        setIsLoading(true);
        try {
            await updateUserProfile(session.user.id, {
                top_genres: formData.top_genres,
                top_artists: formData.top_artists,
                top_songs: formData.top_songs,
                artist_images: formData.artist_images.map(img => img.url),
                song_images: formData.song_images.map(img => img.url),
                sprint_5_variant: formData.sprint_5_variant,
            });

            Alert.alert('Success', 'Music taste updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Error updating music taste:', error);
            Alert.alert('Error', 'Failed to update music taste');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Edit Music Taste' }} />

            <View style={styles.content}>
                <MusicTasteStep
                    formData={formData}
                    updateFormData={updateFormData}
                />
            </View>

            <View style={styles.footer}>
                <Button
                    title="Save Changes"
                    onPress={handleSave}
                    loading={isLoading}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
    },
    footer: {
        padding: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
});
