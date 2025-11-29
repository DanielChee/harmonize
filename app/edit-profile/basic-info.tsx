import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS, SPACING } from '@constants';
import { Button } from '@components';
import { BasicInfoStep } from '@features/profile-setup/BasicInfoStep';
import { useUserStore } from '@store';
import { updateUserProfile } from '@services/supabase/user';

export default function EditBasicInfoScreen() {
    const router = useRouter();
    const { currentUser, setCurrentUser, session } = useUserStore();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        display_name: '',
        city: '',
        age: 0,
        mbti: '',
        pronouns: '',
        bio: '',
    });

    useEffect(() => {
        if (currentUser) {
            setFormData({
                display_name: currentUser.display_name || '',
                city: currentUser.city || '',
                age: currentUser.age || 0,
                mbti: currentUser.mbti || '',
                pronouns: currentUser.pronouns || '',
                bio: currentUser.bio || '',
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
            // In a real app, we would validate here

            // Update database
            const updatedUser = await updateUserProfile(session.user.id, formData);

            // Update local store with the returned user from the database
            if (updatedUser) {
                setCurrentUser(updatedUser);
            }


            Alert.alert('Success', 'Profile updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Edit Basic Info' }} />

            <View style={styles.content}>
                <BasicInfoStep
                    formData={formData}
                    updateFormData={updateFormData}
                    onFieldInteraction={() => { }} // Not needed for edit mode
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
