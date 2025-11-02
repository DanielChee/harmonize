/**
 * DEVELOPMENT ONLY - NOT FOR PRODUCTION
 *
 * Component Test Screen
 * Visual validation for all Figma-based components
 *
 * This screen is for development/testing purposes only.
 * Located in app/(dev)/ to separate from production code.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, Image, TouchableOpacity } from 'react-native';
import { Button, Card, Tag, SettingsRow, Input } from '@components';
import { TestTabSwitcher } from '@components/TestTabSwitcher';
import { SpotifyButton } from '@components/SpotifyButton';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { TEST_USER, TEST_SPOTIFY_DATA } from '@/utils';
import { ProfileCardHigh } from '@/features/profile/ProfileCardHigh';
import { ProfileCardMid } from '@/features/profile/ProfileCardMid';
import { ProfileCardLow } from '@/features/profile/ProfileCardLow';
import { TEST_PROFILES } from '@utils/profileCycler';
import { useRouter } from 'expo-router';
import { scale, verticalScale, moderateScale, getDeviceType, responsiveSizes, SCREEN_WIDTH, SCREEN_HEIGHT } from '@utils/responsive';
import { useUserStore } from '@store';
import type { SpotifyData } from '@types';

export default function TestComponentsScreen() {
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set(['Pop', 'Jazz']));
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [switchValue, setSwitchValue] = useState(false);

  // Zustand store
  const { spotifyData, setSpotifyData } = useUserStore();
  const [useRealData, setUseRealData] = useState(false);

  // Match screen state
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'high' | 'mid' | 'low'>('mid');

  // Determine which data to use for profile display
  const displaySpotifyData = useRealData && spotifyData ? spotifyData : TEST_SPOTIFY_DATA;
  const displayUser = TEST_USER; // Keep using test user for now, only Spotify data changes

  const handleSpotifySuccess = (data: SpotifyData) => {
    setSpotifyData(data);
    setUseRealData(true);
  };

  const handleSpotifyError = (error: Error) => {
    console.error('Spotify error:', error);
  };

  const toggleTag = (tag: string) => {
    const newSelected = new Set(selectedTags);
    if (newSelected.has(tag)) {
      newSelected.delete(tag);
    } else {
      newSelected.add(tag);
    }
    setSelectedTags(newSelected);
  };

  // Match screen functions
  const handleNext = () => {
    setCurrentProfileIndex((prev) => (prev + 1) % TEST_PROFILES.length);
  };

  const handlePrevious = () => {
    setCurrentProfileIndex((prev) => (prev - 1 + TEST_PROFILES.length) % TEST_PROFILES.length);
  };

  const handleLike = () => {
    console.log('Liked profile:', currentProfileIndex);
    handleNext();
  };

  const handlePass = () => {
    console.log('Passed profile:', currentProfileIndex);
    handlePrevious();
  };

  const cycleViewMode = () => {
    const modes: ('high' | 'mid' | 'low')[] = ['high', 'mid', 'low'];
    const currentModeIndex = modes.indexOf(viewMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setViewMode(nextMode);
  };

  const currentProfile = TEST_PROFILES[currentProfileIndex];
  const viewModeLabel = viewMode === 'high' ? 'High Detail' : viewMode === 'mid' ? 'Mid Detail' : 'Low Detail';

  return (
    <View style={styles.wrapper}>
      <TestTabSwitcher />

      {/* Navigation Button to Main App */}
      <TouchableOpacity
        style={styles.backToAppButton}
        onPress={() => router.push('/(tabs)/profile')}
        activeOpacity={0.7}
      >
        <MaterialIcons name="arrow-back" size={20} color={COLORS.text.inverse} />
        <Text style={styles.backToAppText}>Back to Main App</Text>
      </TouchableOpacity>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Component Test Gallery</Text>
        <Text style={styles.subtitle}>Visual validation of Figma components</Text>

      {/* Button Tests */}
      <Section title="Button Component" subtitle="ActionButtonPill from Figma">
        <TestGroup label="Filled Variant (Black bg, White text, 14px)">
          <Button title="Login with Spotify" onPress={() => console.log('Pressed')} variant="filled" />
          <Button
            title="Disabled Filled"
            onPress={() => console.log('Pressed')}
            variant="filled"
            disabled
          />
          <Button
            title="Loading..."
            onPress={() => console.log('Pressed')}
            variant="filled"
            loading={loading}
          />
        </TestGroup>

        <TestGroup label="Outlined Variant (Transparent, Black border, 12px)">
          <Button title="SSO Login" onPress={() => console.log('Pressed')} variant="outlined" />
          <Button
            title="Disabled Outlined"
            onPress={() => console.log('Pressed')}
            variant="outlined"
            disabled
          />
        </TestGroup>

        <TestGroup label="Full Width">
          <Button
            title="Full Width Button"
            onPress={() => setLoading(!loading)}
            variant="filled"
            fullWidth
          />
        </TestGroup>

        <ChecklistItem
          items={[
            'Filled: Black bg (#000000), white text, 14px',
            'Outlined: Transparent bg, 1px black border, 12px text',
            'Border radius: 30px (pill shape)',
            'Touch target: minimum 44px height',
            'Disabled: Gray colors, 0.6 opacity',
          ]}
        />
      </Section>

      {/* Card Tests */}
      <Section title="Card Component" subtitle="InfoCard from Figma">
        <TestGroup label="Default Variant (White bg, shadow, 1px outline)">
          <Card>
            <Text style={styles.cardText}>Simple card with default padding</Text>
          </Card>
        </TestGroup>

        <TestGroup label="With Icon and Badge">
          <Card
            icon={<MaterialIcons name="school" size={20} color="rgba(0,0,0,0.8)" />}
            badge={<MaterialIcons name="verified" size={16} color="rgba(0,0,0,0.8)" />}
          >
            <Text style={styles.cardText}>Georgia Tech</Text>
          </Card>
        </TestGroup>

        <TestGroup label="Card Variants">
          <Card variant="default">
            <Text style={styles.cardText}>Default (shadow + outline)</Text>
          </Card>
          <Card variant="elevated">
            <Text style={styles.cardText}>Elevated (stronger shadow)</Text>
          </Card>
          <Card variant="outlined">
            <Text style={styles.cardText}>Outlined (border only)</Text>
          </Card>
        </TestGroup>

        <ChecklistItem
          items={[
            'Background: White (#FFFFFF)',
            'Shadow: 0px 2px 8px rgba(0,0,0,0.1)',
            'Border: 1px solid outline',
            'Border radius: 16px',
            'Icon: 24x24px container',
            'Badge: 20x20px container',
          ]}
        />
      </Section>

      {/* Tag Tests */}
      <Section title="Tag Component" subtitle="GenreTag from Figma">
        <TestGroup label="Interactive Tags (Selected = Green)">
          <View style={styles.tagGrid}>
            {['Pop', 'Rock', 'Jazz', 'Hip-Hop', 'EDM', 'Indie'].map((genre) => (
              <Tag
                key={genre}
                label={genre}
                selected={selectedTags.has(genre)}
                onPress={() => toggleTag(genre)}
              />
            ))}
          </View>
        </TestGroup>

        <TestGroup label="Tag States">
          <View style={styles.tagGrid}>
            <Tag label="Unselected" selected={false} onPress={() => {}} />
            <Tag label="Selected" selected={true} onPress={() => {}} />
            <Tag label="Disabled" disabled onPress={() => {}} />
            <Tag label="Read Only" readOnly />
          </View>
        </TestGroup>

        <ChecklistItem
          items={[
            'Unselected: Transparent bg, black 50% border',
            'Selected: Spotify green (#1DB954) bg, white text',
            'Height: 40px',
            'Border radius: 5px',
            'Font: 14px, weight 400',
            'Padding: 12px horizontal, 10px vertical',
          ]}
        />
      </Section>

      {/* SettingsRow Tests */}
      <Section title="SettingsRow Component" subtitle="Settings row from Figma">
        <TestGroup label="Standard Rows (Label + Description + Value)">
          <Card variant="outlined">
            <SettingsRow
              label="Location"
              description="Set your location"
              value="Atlanta, GA"
              onPress={() => console.log('Navigate to location')}
            />
            <SettingsRow
              label="University"
              description="Verify your school"
              value="Georgia Tech"
              onPress={() => console.log('Navigate to university')}
            />
            <SettingsRow
              label="Age"
              description="Your age"
              value="21"
              onPress={() => console.log('Navigate to age')}
            />
          </Card>
        </TestGroup>

        <TestGroup label="Variants">
          <Card variant="outlined">
            <SettingsRow label="Label Only" value="Value" onPress={() => {}} />
            <SettingsRow
              label="No Value"
              description="Just navigation"
              onPress={() => {}}
            />
            <SettingsRow
              label="No Chevron"
              value="Read-only"
              showChevron={false}
            />
            <SettingsRow
              label="With Switch"
              description="Toggle setting"
              showChevron={false}
              rightComponent={
                <Switch value={switchValue} onValueChange={setSwitchValue} />
              }
            />
            <SettingsRow
              label="Disabled"
              description="Cannot interact"
              value="Locked"
              disabled
            />
          </Card>
        </TestGroup>

        <ChecklistItem
          items={[
            'Height: 48px (exceeds 44px minimum)',
            'Label: 14px black text',
            'Description: 12px black 50% opacity',
            'Value: 14px black text',
            'Chevron: 16x16px, black 80% opacity',
            'Layout: space-between, label left, value+chevron right',
          ]}
        />
      </Section>

      {/* Input Tests */}
      <Section title="Input Component" subtitle="Existing component">
        <TestGroup label="Input Variants">
          <Input
            label="Bio"
            placeholder="Tell us about yourself"
            value={inputValue}
            onChangeText={setInputValue}
            multiline
            numberOfLines={3}
            maxLength={100}
          />
          <Input
            label="Email"
            placeholder="your@email.com"
            value=""
            onChangeText={() => {}}
            keyboardType="email-address"
          />
          <Input
            label="Disabled"
            placeholder="Cannot edit"
            value="Locked value"
            onChangeText={() => {}}
            disabled
          />
          <Input
            label="With Error"
            placeholder="Enter value"
            value=""
            onChangeText={() => {}}
            error="This field is required"
          />
        </TestGroup>
      </Section>

      {/* Responsive Scaling Tests */}
      <Section title="Responsive Scaling" subtitle="Verify scaling calculations for different screen sizes">
        <Card variant="elevated">
          <Text style={styles.scalingHeader}>Current Device</Text>
          <Text style={styles.scalingText}>Screen Width: {SCREEN_WIDTH}px</Text>
          <Text style={styles.scalingText}>Screen Height: {SCREEN_HEIGHT}px</Text>
          <Text style={styles.scalingText}>Device Type: {JSON.stringify(getDeviceType(), null, 2).replace(/[{}"]/g, '')}</Text>
        </Card>

        <Card variant="elevated" style={{ marginTop: SPACING.md }}>
          <Text style={styles.scalingHeader}>Scaling Functions Test</Text>
          <Text style={styles.scalingText}>scale(64): {Math.round(scale(64))}px (action button)</Text>
          <Text style={styles.scalingText}>moderateScale(64): {Math.round(moderateScale(64))}px (balanced)</Text>
          <Text style={styles.scalingText}>moderateScale(100): {Math.round(moderateScale(100))}px (avatar)</Text>
          <Text style={styles.scalingText}>verticalScale(200): {Math.round(verticalScale(200))}px (featured song)</Text>
        </Card>

        <Card variant="elevated" style={{ marginTop: SPACING.md }}>
          <Text style={styles.scalingHeader}>Responsive Sizes (Pre-calculated)</Text>
          <Text style={styles.scalingText}>Action Button: {Math.round(responsiveSizes.actionButton.width)}x{Math.round(responsiveSizes.actionButton.height)}px</Text>
          <Text style={styles.scalingText}>Avatar Large: {Math.round(responsiveSizes.avatar.large)}px</Text>
          <Text style={styles.scalingText}>Avatar Medium: {Math.round(responsiveSizes.avatar.medium)}px</Text>
          <Text style={styles.scalingText}>Avatar Small: {Math.round(responsiveSizes.avatar.small)}px</Text>
          <Text style={styles.scalingText}>Artist Image: {Math.round(responsiveSizes.artistImage.large)}px</Text>
          <Text style={styles.scalingText}>Review Avatar: {Math.round(responsiveSizes.reviewAvatar)}px</Text>
          <Text style={styles.scalingText}>Concert Image: {Math.round(responsiveSizes.concertImage)}px</Text>
        </Card>

        <Card variant="elevated" style={{ marginTop: SPACING.md }}>
          <Text style={styles.scalingHeader}>Visual Test: Action Buttons</Text>
          <View style={styles.scalingButtonContainer}>
            <View style={[styles.scalingButton, {
              width: responsiveSizes.actionButton.width,
              height: responsiveSizes.actionButton.height,
              borderRadius: responsiveSizes.actionButton.borderRadius,
              borderColor: COLORS.error,
              borderWidth: 2,
            }]}>
              <MaterialCommunityIcons name="close" size={responsiveSizes.icon.xlarge} color={COLORS.error} />
            </View>
            <View style={[styles.scalingButton, {
              width: responsiveSizes.actionButton.width,
              height: responsiveSizes.actionButton.height,
              borderRadius: responsiveSizes.actionButton.borderRadius,
              borderColor: COLORS.success,
              borderWidth: 2,
            }]}>
              <MaterialCommunityIcons name="heart" size={responsiveSizes.icon.xlarge} color={COLORS.success} />
            </View>
          </View>
          <Text style={[styles.scalingText, { textAlign: 'center', marginTop: SPACING.sm }]}>
            These buttons scale with screen size
          </Text>
        </Card>

        <ChecklistItem
          items={[
            `Base dimensions: 320x568 (iPhone SE - smallest modern iPhone)`,
            `Current screen: ${SCREEN_WIDTH}x${SCREEN_HEIGHT}`,
            `Scale factor: ${(SCREEN_WIDTH / 320).toFixed(2)}x horizontal`,
            `Moderate scale reduces over-scaling by 50%`,
            `All devices scale UP from iPhone SE baseline`,
            `Tested on: ${SCREEN_WIDTH <= 320 ? 'iPhone SE' : SCREEN_WIDTH < 375 ? 'Small Phone' : SCREEN_WIDTH < 600 ? 'Phone' : 'Tablet'}`,
          ]}
        />
      </Section>

      {/* Test Profile */}
      <Section title="Test Profile" subtitle={useRealData ? "Your Real Spotify Data" : "Mock user data for development"}>
        <Card variant="elevated">
          {/* Data Source Toggle */}
          <View style={styles.dataSourceToggle}>
            <Text style={styles.dataSourceText}>
              {useRealData ? "✅ Using Real Spotify Data" : "📋 Using Mock Data"}
            </Text>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setUseRealData(!useRealData)}
              disabled={!spotifyData}
            >
              <Text style={[styles.toggleButtonText, !spotifyData && styles.toggleButtonDisabled]}>
                {useRealData ? "Switch to Mock" : "Switch to Real"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Spotify Connect Button (if no data) */}
          {!spotifyData && (
            <View style={styles.spotifyConnectSection}>
              <Text style={styles.spotifyConnectText}>Connect Spotify to see your real profile data</Text>
              <SpotifyButton
                onSuccess={handleSpotifySuccess}
                onError={handleSpotifyError}
              />
            </View>
          )}

          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: displayUser.profile_picture_url }}
              style={styles.profileAvatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{displayUser.display_name}</Text>
              <Text style={styles.profileMeta}>
                {displayUser.age} • {displayUser.pronouns}
              </Text>
            </View>
          </View>

          {/* Bio */}
          <Text style={styles.profileBio}>{displayUser.bio}</Text>

          {/* Info Cards */}
          <View style={styles.profileSection}>
            <Card
              icon={<MaterialIcons name="school" size={20} color="rgba(0,0,0,0.8)" />}
              badge={
                TEST_USER.is_verified ? (
                  <MaterialIcons name="verified" size={16} color={COLORS.success} />
                ) : undefined
              }
            >
              <Text style={styles.cardText}>{TEST_USER.university}</Text>
            </Card>

            <Card icon={<MaterialIcons name="location-on" size={20} color="rgba(0,0,0,0.8)" />}>
              <Text style={styles.cardText}>{TEST_USER.city}</Text>
            </Card>

            <Card icon={<MaterialIcons name="people" size={20} color="rgba(0,0,0,0.8)" />}>
              <Text style={styles.cardText}>Looking for {TEST_USER.looking_for}</Text>
            </Card>
          </View>

          {/* Top Genres */}
          <Text style={styles.label}>Top Genres</Text>
          <View style={styles.tagGrid}>
            {displaySpotifyData.top_genres.map((genre) => (
              <Tag key={genre} label={genre} selected readOnly />
            ))}
          </View>

          {/* Top Artists */}
          <Text style={styles.label}>Top Artists</Text>
          <View style={styles.artistGrid}>
            {displaySpotifyData.top_artists.slice(0, 3).map((artist) => (
              <View key={artist.id} style={styles.artistItem}>
                <Image source={{ uri: artist.image_url }} style={styles.artistImage} />
                <Text style={styles.artistName} numberOfLines={1}>
                  {artist.name}
                </Text>
              </View>
            ))}
          </View>

          {/* Actions */}
          <View style={styles.buttonGroup}>
            <Button
              title="Connect Spotify"
              onPress={() => console.log('OAuth')}
              variant="filled"
              fullWidth
            />
            <Button
              title="Edit Profile"
              onPress={() => console.log('Edit')}
              variant="outlined"
              fullWidth
            />
          </View>
        </Card>
      </Section>

      {/* Match Screen with Profile Cycling */}
      <Section title="Match Screen - Profile Cycling" subtitle="Interactive profile browser with actions">
        <Text style={styles.infoText}>
          Test the new Match screen functionality: cycle through 3 test profiles with view modes and action buttons.
        </Text>

        <Card variant="elevated">
          {/* Header with controls */}
          <View style={styles.matchHeader}>
            <TouchableOpacity style={styles.viewModeButton} onPress={cycleViewMode}>
              <MaterialIcons name="remove-red-eye" size={20} color={COLORS.primary} />
              <Text style={styles.viewModeText}>{viewModeLabel}</Text>
            </TouchableOpacity>

            <View style={styles.profileCounter}>
              <Text style={styles.counterText}>
                Profile {currentProfileIndex + 1} / {TEST_PROFILES.length}
              </Text>
            </View>
          </View>

          {/* Profile Card Display */}
          <View style={styles.matchCardContainer}>
            <ScrollView style={styles.matchScrollView} showsVerticalScrollIndicator={false}>
              {viewMode === 'high' && (
                <ProfileCardHigh user={currentProfile.user} spotifyData={currentProfile.spotify} />
              )}
              {viewMode === 'mid' && (
                <ProfileCardMid user={currentProfile.user} spotifyData={currentProfile.spotify} />
              )}
              {viewMode === 'low' && (
                <ProfileCardLow user={currentProfile.user} spotifyData={currentProfile.spotify} />
              )}
            </ScrollView>
          </View>

          {/* Action Buttons (Pass = Previous, Like = Next) */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={[styles.actionButton, styles.passButton]} onPress={handlePass}>
              <MaterialCommunityIcons name="close" size={32} color={COLORS.error} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.likeButton]} onPress={handleLike}>
              <MaterialCommunityIcons name="heart" size={32} color={COLORS.success} />
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={styles.matchInfo}>
            <Text style={styles.matchInfoText}>
              Pass (X) = Previous • Like (♥) = Next
            </Text>
            <Text style={styles.matchInfoSubtext}>
              Current: {currentProfile.user.display_name} • {currentProfile.user.university}
            </Text>
          </View>
        </Card>

        <ChecklistItem
          items={[
            'View Mode Toggle: Cycles High → Mid → Low → High',
            'Pass Button (X): Red border, goes to PREVIOUS profile',
            'Like Button (♥): Green border, goes to NEXT profile',
            'Profile Counter: Shows current position',
            '3 Test Profiles: Alex (GT), Jordan (Emory), Taylor (GSU)',
            'Simplified UI: No separate navigation arrows',
          ]}
        />
      </Section>

      {/* Profile Detail Levels */}
      <Section title="Profile Detail Levels" subtitle="High, Mid, and Low detail views">
        <Text style={styles.infoText}>
          Three profile view modes for user testing. Swipe through to see different detail levels.
        </Text>

        {/* High Detail */}
        <View style={styles.profileCard}>
          <Text style={styles.profileCardTitle}>HIGH DETAIL - Full Information</Text>
          <View style={styles.profileCardContainer}>
            <ProfileCardHigh user={displayUser} spotifyData={displaySpotifyData} />
          </View>
        </View>

        {/* Mid Detail */}
        <View style={styles.profileCard}>
          <Text style={styles.profileCardTitle}>MID DETAIL - Balanced View</Text>
          <View style={styles.profileCardContainer}>
            <ProfileCardMid user={displayUser} spotifyData={displaySpotifyData} />
          </View>
        </View>

        {/* Low Detail */}
        <View style={styles.profileCard}>
          <Text style={styles.profileCardTitle}>LOW DETAIL - Image-Heavy</Text>
          <View style={styles.profileCardContainerLow}>
            <ProfileCardLow user={displayUser} spotifyData={displaySpotifyData} />
          </View>
        </View>
      </Section>

      {/* Settings Example */}
      <Section title="Profile Settings" subtitle="Using SettingsRow with test data">
        <Card variant="outlined">
          <SettingsRow
            label="Display Name"
            description="How others see you"
            value={TEST_USER.display_name}
            onPress={() => console.log('Edit name')}
          />
          <SettingsRow
            label="University"
            description="Verify your school"
            value={TEST_USER.university}
            onPress={() => console.log('Edit university')}
          />
          <SettingsRow
            label="Location"
            description="Set your city"
            value={TEST_USER.city}
            onPress={() => console.log('Edit location')}
          />
          <SettingsRow
            label="Pronouns"
            value={TEST_USER.pronouns}
            onPress={() => console.log('Edit pronouns')}
          />
          <SettingsRow
            label="Show on Profile"
            description="Display university publicly"
            showChevron={false}
            rightComponent={<Switch value={TEST_USER.show_university} onValueChange={() => {}} />}
          />
        </Card>
      </Section>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ✅ All components ready for implementation
        </Text>
        <Text style={styles.footerSubtext}>
          Skeletons created from Figma specs. Complete TODOs to finalize.
        </Text>
      </View>
      </ScrollView>
    </View>
  );
}

// Helper Components
const Section = ({ title, subtitle, children }: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    {children}
  </View>
);

const TestGroup = ({ label, children }: any) => (
  <View style={styles.testGroup}>
    <Text style={styles.testLabel}>{label}</Text>
    {children}
  </View>
);

const ChecklistItem = ({ items }: { items: string[] }) => (
  <View style={styles.checklist}>
    <Text style={styles.checklistTitle}>Figma Specs Checklist:</Text>
    {items.map((item, index) => (
      <Text key={index} style={styles.checklistItem}>
        • {item}
      </Text>
    ))}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  testGroup: {
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  testLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  cardText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  checklist: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  checklistTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  checklistItem: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
    lineHeight: 18,
  },
  profileSection: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  buttonGroup: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: SPACING['2xl'],
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  footerSubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: SPACING.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  profileMeta: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  profileBio: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  artistGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  artistItem: {
    alignItems: 'center',
    flex: 1,
  },
  artistImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: SPACING.xs,
  },
  artistName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  profileCard: {
    marginBottom: SPACING.xl,
  },
  profileCardTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  profileCardContainer: {
    height: 600,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  profileCardContainerLow: {
    height: 700,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.text.primary,
  },
  backToAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
  },
  backToAppText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.inverse,
  },
  // Match screen styles
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  viewModeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.medium as any,
  },
  profileCounter: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  counterText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium as any,
  },
  matchCardContainer: {
    height: 600,
    backgroundColor: COLORS.background,
  },
  matchScrollView: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    gap: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passButton: {
    borderWidth: 2,
    borderColor: COLORS.error,
  },
  likeButton: {
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  matchInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  matchInfoText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  matchInfoSubtext: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    fontStyle: 'italic',
  },
  // Data source toggle styles
  dataSourceToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dataSourceText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  toggleButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  toggleButtonText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.inverse,
  },
  toggleButtonDisabled: {
    opacity: 0.5,
  },
  spotifyConnectSection: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  spotifyConnectText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  // Responsive scaling test styles
  scalingHeader: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  scalingText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
    fontFamily: 'monospace',
  },
  scalingButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xl,
    marginTop: SPACING.md,
  },
  scalingButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
