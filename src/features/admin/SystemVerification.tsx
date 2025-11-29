import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '@constants';
import { VerificationSuite, TestResult } from '@features/testing/VerificationSuite';

export function SystemVerification() {
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
            <ScrollView style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.title}>System Diagnostics</Text>
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
    content: {
        flex: 1,
        padding: SPACING.md,
    },
    card: {
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.md,
        marginBottom: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text.primary,
        marginBottom: SPACING.sm,
    },
    description: {
        fontSize: 14,
        color: COLORS.text.secondary,
        marginBottom: SPACING.lg,
        lineHeight: 20,
    },
    runButton: {
        backgroundColor: COLORS.primary,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.sm,
        alignItems: 'center',
    },
    runButtonDisabled: {
        opacity: 0.7,
    },
    runButtonText: {
        color: COLORS.text.inverse,
        fontWeight: '600',
        fontSize: 16,
    },
    resultsContainer: {
        gap: SPACING.md,
        paddingBottom: SPACING.xl,
    },
    resultItem: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        borderRadius: BORDER_RADIUS.sm,
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
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.text.primary,
    },
    duration: {
        fontSize: 12,
        color: COLORS.text.tertiary,
    },
    resultMessage: {
        fontSize: 14,
        color: COLORS.text.secondary,
        marginLeft: 32,
    },
    errorMessage: {
        color: COLORS.error,
    },
});
