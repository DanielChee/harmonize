import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS, SPACING } from '@constants';
import { Button } from '@components';
import { UniversityVerificationStep } from '@features/profile-setup/UniversityVerificationStep';
import { useUserStore } from '@store';

export default function EditUniversityScreen() {
    const router = useRouter();
    const { currentUser, setCurrentUser, session } = useUserStore();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        university: '',
        academic_field: '',
        academic_year: '',
        student_email: '',
    });

    useEffect(() => {
        if (currentUser) {
            setFormData({
                university: currentUser.university || '',
                academic_field: currentUser.academic_field || '',
                academic_year: currentUser.academic_year || '',
                student_email: '', // Don't pre-fill email for privacy/security re-verification
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

            Alert.alert('Success', 'University info updated successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to update university info');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Edit University' }} />

            <View style={styles.content}>
                <UniversityVerificationStep
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
