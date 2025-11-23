import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import { Button, Card, Input, Tag, SettingsRow } from '@components';

export default function ElementsScreen() {
    const [inputValue, setInputValue] = useState('');

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'UI Elements' }} />
            <ScrollView contentContainerStyle={styles.content}>

                <Text style={styles.header}>Buttons</Text>
                <View style={styles.section}>
                    <Button title="Primary Button" onPress={() => { }} variant="primary" />
                    <Button title="Secondary Button" onPress={() => { }} variant="secondary" />
                    <Button title="Outline Button" onPress={() => { }} variant="outline" />
                    <Button title="Ghost Button" onPress={() => { }} variant="ghost" />
                    <Button title="Danger Button" onPress={() => { }} variant="danger" />
                    <Button title="Loading..." loading onPress={() => { }} />
                    <Button title="Disabled" disabled onPress={() => { }} />
                </View>

                <Text style={styles.header}>Inputs</Text>
                <View style={styles.section}>
                    <Input
                        label="Standard Input"
                        placeholder="Type something..."
                        value={inputValue}
                        onChangeText={setInputValue}
                    />
                    <Input
                        label="Error Input"
                        placeholder="Invalid input"
                        error="This field has an error"
                    />
                    <Input
                        label="Disabled Input"
                        placeholder="Cannot type here"
                        editable={false}
                    />
                </View>

                <Text style={styles.header}>Cards</Text>
                <View style={styles.section}>
                    <Card>
                        <Text style={styles.cardText}>This is a standard card component.</Text>
                    </Card>
                    <Card variant="elevated">
                        <Text style={styles.cardText}>This is an elevated card.</Text>
                    </Card>
                    <Card variant="outlined">
                        <Text style={styles.cardText}>This is an outlined card.</Text>
                    </Card>
                </View>

                <Text style={styles.header}>Tags</Text>
                <View style={styles.row}>
                    <Tag label="Primary" variant="primary" />
                    <Tag label="Secondary" variant="secondary" />
                    <Tag label="Outline" variant="outline" />
                    <Tag label="Success" variant="success" />
                    <Tag label="Warning" variant="warning" />
                    <Tag label="Error" variant="error" />
                </View>

                <Text style={styles.header}>Settings Rows</Text>
                <View style={styles.section}>
                    <SettingsRow
                        label="Setting Item"
                        onPress={() => Alert.alert('Pressed')}
                        showChevron
                    />
                    <SettingsRow
                        label="With Value"
                        value="Enabled"
                        onPress={() => { }}
                    />
                    <SettingsRow
                        label="Destructive"
                        variant="danger"
                        onPress={() => { }}
                    />
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
        gap: SPACING.lg,
    },
    header: {
        ...TYPOGRAPHY.scale.h3,
        color: COLORS.text.primary,
        marginBottom: SPACING.sm,
        marginTop: SPACING.md,
    },
    section: {
        gap: SPACING.md,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    cardText: {
        ...TYPOGRAPHY.scale.body,
        color: COLORS.text.primary,
    },
});
