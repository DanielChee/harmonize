import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@constants';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditProfileMenuScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const menuItems = [
        {
            id: 'basic',
            title: 'Basic Information',
            description: 'Name, bio, age, city, pronouns',
            icon: 'person',
            route: '/edit-profile/basic-info',
        },
        {
            id: 'music',
            title: 'Music Taste',
            description: 'Top genres, artists, songs',
            icon: 'music-note',
            route: '/edit-profile/music',
        },
        {
            id: 'photos',
            title: 'Profile Picture',
            description: 'Update your profile photo',
            icon: 'image',
            route: '/edit-profile/photos',
        },
        {
            id: 'concerts',
            title: 'Concert Preferences',
            description: 'Budget, seating, transportation',
            icon: 'event',
            route: '/edit-profile/concerts',
        },
        {
            id: 'university',
            title: 'University Verification',
            description: 'School, major, year',
            icon: 'school',
            route: '/edit-profile/university',
        },
    ];

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Edit Profile',
                    headerShown: true,
                    headerBackTitle: 'Profile',
                }}
            />

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.headerDescription}>
                    Select a section to edit. Your changes will be saved immediately.
                </Text>

                <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={() => router.push(item.route)}
                        >
                            <View style={styles.iconContainer}>
                                <MaterialIcons name={item.icon as any} size={24} color={COLORS.primary} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.itemTitle}>{item.title}</Text>
                                <Text style={styles.itemDescription}>{item.description}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color={COLORS.text.secondary} />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: SPACING.lg,
    },
    headerDescription: {
        ...TYPOGRAPHY.scale.body,
        color: COLORS.text.secondary,
        marginBottom: SPACING.xl,
    },
    menuContainer: {
        gap: SPACING.md,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: `${COLORS.primary}15`, // 15% opacity
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    textContainer: {
        flex: 1,
    },
    itemTitle: {
        ...TYPOGRAPHY.scale.body,
        fontWeight: TYPOGRAPHY.weights.semibold,
        color: COLORS.text.primary,
        marginBottom: 2,
    },
    itemDescription: {
        ...TYPOGRAPHY.scale.caption,
        color: COLORS.text.secondary,
    },
});
