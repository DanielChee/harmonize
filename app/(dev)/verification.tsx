import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import { VerificationSuite, TestResult } from '@features/testing/VerificationSuite';

export default function VerificationScreen() {
    const router = useRouter();
    const [results, setResults] = useState<TestResult[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const suiteRef = useRef<VerificationSuite | null>(null);

    useEffect(() => {
        suiteRef.current = new VerificationSuite(setResults);
    }, []);

    const handleRunAll = async () => {
        if (!suiteRef.current || isRunning) return;

        setIsRunning(true);
        await suiteRef.current.runAll();
        setIsRunning(false);
    };

    const getStatusColor = (status: TestResult['status']) => {
        switch (status) {
            case 'success': return COLORS.success;
            case 'failure': return COLORS.error;
            case 'running': return COLORS.primary;
            default: return COLORS.text.secondary;
        }
    };

    const getStatusIcon = (status: TestResult['status']) => {
        switch (status) {
            case 'success': return 'check-circle';
            case 'failure': return 'error';
            case 'running': return 'hourglass-empty';
            default: return 'radio-button-unchecked';
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>System Verification</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.description}>
                        Run this suite to verify core system functionality, database connectivity, and logic integrity.
                    </Text>

                    <TouchableOpacity
                        style={[styles.runButton, isRunning && styles.runButtonDisabled]}
                        onPress={handleRunAll}
                        disabled={isRunning}
                    >
                        {isRunning ? (
                            <ActivityIndicator color={COLORS.text.inverse} />
                        ) : (
                            <Text style={styles.runButtonText}>Run All Tests</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.resultsContainer}>
                    {results.map((result) => (
                        <View key={result.id} style={styles.resultItem}>
                            <View style={styles.resultHeader}>
                                <View style={styles.resultTitleContainer}>
                                    <MaterialIcons
                                        name={getStatusIcon(result.status)}
                                        size={24}
                                        color={getStatusColor(result.status)}
                                    />
                                    <Text style={styles.resultName}>{result.name}</Text>
                                </View>
                                {result.duration !== undefined && (
                                    <Text style={styles.duration}>{result.duration}ms</Text>
                                )}
                            </View>

                            {result.message && (
                                <Text style={[
                                    styles.resultMessage,
                                    result.status === 'failure' && styles.errorMessage
                                ]}>
                                    {result.message}
                                </Text>
                            )}
                        </View>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        marginRight: SPACING.md,
    },
    title: {
        fontSize: TYPOGRAPHY.sizes.xl,
        fontWeight: TYPOGRAPHY.weights.bold,
        color: COLORS.text.primary,
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
    },
    card: {
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        borderRadius: 12,
        marginBottom: SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    description: {
        fontSize: TYPOGRAPHY.sizes.base,
        color: COLORS.text.secondary,
        marginBottom: SPACING.lg,
        lineHeight: 20,
    },
    runButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    runButtonDisabled: {
        opacity: 0.7,
    },
    runButtonText: {
        color: COLORS.text.inverse,
        fontWeight: TYPOGRAPHY.weights.semibold,
        fontSize: TYPOGRAPHY.sizes.lg,
    },
    resultsContainer: {
        gap: SPACING.md,
        paddingBottom: SPACING.xl,
    },
    resultItem: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xs,
    },
    resultTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    resultName: {
        fontSize: TYPOGRAPHY.sizes.base,
        fontWeight: TYPOGRAPHY.weights.medium,
        color: COLORS.text.primary,
    },
    duration: {
        fontSize: TYPOGRAPHY.sizes.xs,
        color: COLORS.text.tertiary,
    },
    resultMessage: {
        fontSize: TYPOGRAPHY.sizes.sm,
        color: COLORS.text.secondary,
        marginLeft: 32, // Align with text, skipping icon
    },
    errorMessage: {
        color: COLORS.error,
    },
});
