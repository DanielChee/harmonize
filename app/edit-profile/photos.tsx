import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS, SPACING } from '@constants';
import { Button } from '@components';
import { ProfilePictureStep } from '@features/profile-setup/ProfilePictureStep';
import { useUserStore } from '@store';

export default function EditPhotosScreen() {
    const router = useRouter();
    const { currentUser, setCurrentUser, session } = useUserStore();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        profile_picture_url: '',
    });

    useEffect(() => {
        if (currentUser) {
            setFormData({
                profile_picture_url: currentUser.profile_picture_url || '',
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

            Alert.alert('Success', 'Profile picture updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile picture');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Edit Photos' }} />

            <View style={styles.content}>
                <ProfilePictureStep
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
