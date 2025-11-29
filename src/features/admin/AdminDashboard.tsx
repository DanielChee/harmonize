import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '@constants';
import { AnalyticsViewer } from '../testing/AnalyticsViewer';
import { SessionManager } from './SessionManager';
import { ProfileManager } from './ProfileManager';
import { SystemVerification } from './SystemVerification';
import { VerificationManager } from './VerificationManager';

type Tab = 'metrics' | 'sessions' | 'profiles' | 'system' | 'verifications';

export function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('metrics');
    const insets = useSafeAreaInsets();

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
            case 'verifications':
                return <VerificationManager />;
            default:
                return <AnalyticsViewer />;
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Admin Dashboard</Text>
            </View>

            <View style={styles.tabBarContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarContent}>
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
                        style={[styles.tab, activeTab === 'verifications' && styles.activeTab]}
                        onPress={() => setActiveTab('verifications')}
                    >
                        <Text style={[styles.tabText, activeTab === 'verifications' && styles.activeTabText]}>Verifications</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'system' && styles.activeTab]}
                        onPress={() => setActiveTab('system')}
                    >
                        <Text style={[styles.tabText, activeTab === 'system' && styles.activeTabText]}>System</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <View style={styles.content}>
                {renderContent()}
            </View>
        </View>
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
    tabBarContainer: {
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        flexGrow: 0,
    },
    tabBarContent: {
        flexDirection: 'row',
        paddingHorizontal: SPACING.xs,
    },
    tab: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 100,
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
