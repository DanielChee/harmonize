import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS, SPACING } from '@constants';
import { Button } from '@components';
import { ConcertPreferencesStep } from '@features/profile-setup/ConcertPreferencesStep';
import { useUserStore } from '@store';
import { updateUserProfile } from '@services/supabase/user';

export default function EditConcertsScreen() {
    const router = useRouter();
    const { currentUser, setCurrentUser, session } = useUserStore();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        concert_budget: '',
        concert_seating: '',
        concert_transportation: '',
    });

    useEffect(() => {
        if (currentUser) {
            setFormData({
                concert_budget: currentUser.concert_budget || '',
                concert_seating: currentUser.concert_seating || '',
                concert_transportation: currentUser.concert_transportation || '',
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
            const updatedUser = await updateUserProfile(session.user.id, formData);

            if (updatedUser) {
                setCurrentUser(updatedUser);
            }

            Alert.alert('Success', 'Preferences updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error('Error updating preferences:', error);
            Alert.alert('Error', 'Failed to update preferences');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Edit Preferences' }} />

            <View style={styles.content}>
                <ConcertPreferencesStep
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
