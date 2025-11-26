import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { COLORS, SPACING } from '@constants';
import { AnalyticsViewer } from '../testing/AnalyticsViewer';
import { SessionManager } from './SessionManager';
import { ProfileManager } from './ProfileManager';
import { SystemVerification } from './SystemVerification';

type Tab = 'metrics' | 'sessions' | 'profiles' | 'system';

export function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('metrics');

    const renderContent = () => {
        switch (activeTab) {
            case 'metrics':
                return <AnalyticsViewer />;
            case 'sessions':
                return <SessionManager />;
            case 'profiles':
                return <ProfileManager />;
            case 'system':
                return <SystemVerification />;
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
                    style={[styles.tab, activeTab === 'profiles' && styles.activeTab]}
                    onPress={() => setActiveTab('profiles')}
                >
                    <Text style={[styles.tabText, activeTab === 'profiles' && styles.activeTabText]}>Profiles</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'system' && styles.activeTab]}
                    onPress={() => setActiveTab('system')}
                >
                    <Text style={[styles.tabText, activeTab === 'system' && styles.activeTabText]}>System</Text>
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
        fontSize: 12,
    },
    activeTabText: {
        color: COLORS.primary,
    },
    content: {
        flex: 1,
    },
});
