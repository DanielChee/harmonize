// Test Tab Switcher Component
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '@constants';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TabConfig {
  label: string;
  route: string;
}

const TABS: TabConfig[] = [
  { label: 'Components', route: '/test-components' },
  { label: 'Supabase', route: '/test-supabase' },
];

export const TestTabSwitcher: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabPress = (route: string) => {
    if (pathname !== route) {
      // Use replace to maintain state better
      router.replace(route as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = pathname === tab.route;
          return (
            <TouchableOpacity
              key={tab.route}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => handleTabPress(tab.route)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.text.primary,
  },
  tabText: {
    ...TYPOGRAPHY.scale.caption,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  tabTextActive: {
    color: COLORS.text.inverse,
  },
});
