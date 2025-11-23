import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { COLORS, SPACING } from '@constants';
import { AnalyticsViewer } from '../testing/AnalyticsViewer';
import { SessionManager } from './SessionManager';
import { VerificationManager } from './VerificationManager';

type Tab = 'metrics' | 'sessions' | 'verification';

export function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('metrics');

    const renderContent = () => {
        switch (activeTab) {
            case 'metrics':
                return <AnalyticsViewer />;
            case 'sessions':
                return <SessionManager />;
            case 'verification':
                return <VerificationManager />;
            default:
                return <AnalyticsViewer />;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Admin Dashboard</Text>
            </View>

            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'metrics' && styles.activeTab]}
                    onPress={() => setActiveTab('metrics')}
                >
                    <Text style={[styles.tabText, activeTab === 'metrics' && styles.activeTabText]}>Metrics</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'sessions' && styles.activeTab]}
                    onPress={() => setActiveTab('sessions')}
                >
                    <Text style={[styles.tabText, activeTab === 'sessions' && styles.activeTabText]}>Sessions</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'verification' && styles.activeTab]}
                    onPress={() => setActiveTab('verification')}
                >
                    <Text style={[styles.tabText, activeTab === 'verification' && styles.activeTabText]}>Verify</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {renderContent()}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        backgroundColor: COLORS.surface,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text.primary,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    tab: {
        flex: 1,
        paddingVertical: SPACING.md,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        color: COLORS.text.secondary,
        fontWeight: '600',
    },
    activeTabText: {
        color: COLORS.primary,
    },
    content: {
        flex: 1,
    },
});
