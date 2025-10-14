// Component Test Screen
// Visual validation for all Figma-based components

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, Image, Dimensions } from 'react-native';
import { Button, Card, Tag, SettingsRow, Input } from '@components';
import { TestTabSwitcher } from '@components/TestTabSwitcher';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import { MaterialIcons } from '@expo/vector-icons';
import { TEST_USER, TEST_SPOTIFY_DATA, TEST_GENRES } from '@/utils';
import { ProfileCardHigh } from '@/features/profile/ProfileCardHigh';
import { ProfileCardMid } from '@/features/profile/ProfileCardMid';
import { ProfileCardLow } from '@/features/profile/ProfileCardLow';

export default function TestComponentsScreen() {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set(['Pop', 'Jazz']));
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [switchValue, setSwitchValue] = useState(false);

  const toggleTag = (tag: string) => {
    const newSelected = new Set(selectedTags);
    if (newSelected.has(tag)) {
      newSelected.delete(tag);
    } else {
      newSelected.add(tag);
    }
    setSelectedTags(newSelected);
  };

  return (
    <View style={styles.wrapper}>
      <TestTabSwitcher />
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

      {/* Test Profile */}
      <Section title="Test Profile" subtitle="Mock user data for development">
        <Card variant="elevated">
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <Image
              source={{ uri: TEST_USER.profile_picture_url }}
              style={styles.profileAvatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{TEST_USER.display_name}</Text>
              <Text style={styles.profileMeta}>
                {TEST_USER.age} • {TEST_USER.pronouns}
              </Text>
            </View>
          </View>

          {/* Bio */}
          <Text style={styles.profileBio}>{TEST_USER.bio}</Text>

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

            <Card icon={<MaterialIcons name="headphones" size={20} color="rgba(0,0,0,0.8)" />}>
              <Text style={styles.cardText}>{TEST_USER.hours_on_spotify} hours on Spotify</Text>
            </Card>
          </View>

          {/* Top Genres */}
          <Text style={styles.label}>Top Genres</Text>
          <View style={styles.tagGrid}>
            {TEST_SPOTIFY_DATA.top_genres.map((genre) => (
              <Tag key={genre} label={genre} selected readOnly />
            ))}
          </View>

          {/* Top Artists */}
          <Text style={styles.label}>Top Artists</Text>
          <View style={styles.artistGrid}>
            {TEST_SPOTIFY_DATA.top_artists.slice(0, 3).map((artist) => (
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

      {/* Profile Detail Levels */}
      <Section title="Profile Detail Levels" subtitle="High, Mid, and Low detail views">
        <Text style={styles.infoText}>
          Three profile view modes for user testing. Swipe through to see different detail levels.
        </Text>

        {/* High Detail */}
        <View style={styles.profileCard}>
          <Text style={styles.profileCardTitle}>HIGH DETAIL - Full Information</Text>
          <View style={styles.profileCardContainer}>
            <ProfileCardHigh user={TEST_USER} spotifyData={TEST_SPOTIFY_DATA} />
          </View>
        </View>

        {/* Mid Detail */}
        <View style={styles.profileCard}>
          <Text style={styles.profileCardTitle}>MID DETAIL - Balanced View</Text>
          <View style={styles.profileCardContainer}>
            <ProfileCardMid user={TEST_USER} spotifyData={TEST_SPOTIFY_DATA} />
          </View>
        </View>

        {/* Low Detail */}
        <View style={styles.profileCard}>
          <Text style={styles.profileCardTitle}>LOW DETAIL - Image-Heavy</Text>
          <View style={styles.profileCardContainerLow}>
            <ProfileCardLow user={TEST_USER} spotifyData={TEST_SPOTIFY_DATA} />
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
});
