import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS, SPACING } from '@constants';
import { Button } from '@components';
import { MusicTasteStep } from '@features/profile-setup/MusicTasteStep';
import { useUserStore } from '@store';

export default function EditMusicScreen() {
    const router = useRouter();
    const { currentUser, setCurrentUser, session } = useUserStore();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        top_genres: [] as string[],
        top_artists: [] as string[],
        top_songs: [] as string[],
        sprint_5_variant: undefined as 'variant_a' | 'variant_b' | undefined,
    });

    useEffect(() => {
        if (currentUser) {
            setFormData({
                top_genres: currentUser.top_genres || [],
                top_artists: currentUser.top_artists || [],
                top_songs: currentUser.top_songs || [],
                sprint_5_variant: currentUser.sprint_5_variant,
            });
        }
    }, [currentUser]);

    const updateFormData = (updates: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleSave = async () => {
        if (!session?.user) return;

        setIsLoading(true);
        try {
            // Update local store (simulated)
            if (currentUser) {
                const updatedUser = {
                    ...currentUser,
                    ...formData,
                };
                setCurrentUser(updatedUser);
            }

            Alert.alert('Success', 'Music taste updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
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
