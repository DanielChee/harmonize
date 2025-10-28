import { COLORS } from "@constants";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { fetchAllSpotifyData } from "@services/spotify/api";
import { getValidAccessToken } from "@services/spotify/auth";
import type { SpotifyData, User } from "@types";
import { TEST_PROFILES } from "@utils/profileCycler";
import { responsiveSizes } from "@utils/responsive";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ProfileCardHigh } from "../profile/ProfileCardHigh";
import { ProfileCardLow } from "../profile/ProfileCardLow";
import { ProfileCardMid } from "../profile/ProfileCardMid";
import styles from "./styles";

type ViewMode = 'high' | 'mid' | 'low';

export default function MatchScreen() {
  // const router = useRouter(); // TODO: Use for navigation when implementing profile details
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('mid');
  const [realSpotifyData, setRealSpotifyData] = useState<SpotifyData | null>(null);

  // Load real Spotify data if available
  useEffect(() => {
    const loadSpotifyData = async () => {
      try {
        const token = await getValidAccessToken();
        if (token) {
          const data = await fetchAllSpotifyData();
          setRealSpotifyData(data);
        }
      } catch (error) {
        console.log('No Spotify data available:', error);
      }
    };

    loadSpotifyData();
  }, []);

  const totalProfiles = realSpotifyData ? TEST_PROFILES.length + 1 : TEST_PROFILES.length;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalProfiles);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalProfiles) % totalProfiles);
  };

  const handleLike = () => {
    console.log('Liked profile:', currentIndex);
    // Move to next profile
    handleNext();
  };

  const handlePass = () => {
    console.log('Passed profile:', currentIndex);
    // Move to previous profile
    handlePrevious();
  };

  const cycleViewMode = () => {
    const modes: ViewMode[] = ['high', 'mid', 'low'];
    const currentModeIndex = modes.indexOf(viewMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setViewMode(nextMode);
  };

  // Get current profile data
  const getCurrentProfile = (): { user: User; spotify: SpotifyData } | null => {
    if (currentIndex < TEST_PROFILES.length) {
      return TEST_PROFILES[currentIndex];
    } else if (realSpotifyData && currentIndex === TEST_PROFILES.length) {
      // Create a minimal user profile for real Spotify data
      return {
        user: {
          id: realSpotifyData.spotify_user_id,
          username: realSpotifyData.spotify_username || realSpotifyData.spotify_user_id,
          display_name: realSpotifyData.spotify_username || realSpotifyData.spotify_user_id,
          bio: 'Connected via Spotify',
          age: 0,
          pronouns: '',
          city: '',
          university: '',
          looking_for: 'friends',
          profile_picture_url: '',
          concert_preferences: [],
          verification_level: 0,
          created_at: new Date().toISOString(),
        },
        spotify: realSpotifyData,
      };
    }
    return null;
  };

  const currentProfile = getCurrentProfile();

  if (!currentProfile) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No profiles available</Text>
      </View>
    );
  }

  const viewModeLabel = viewMode === 'high' ? 'High Detail' : viewMode === 'mid' ? 'Mid Detail' : 'Low Detail';
  const isSpotifyProfile = currentIndex === TEST_PROFILES.length && realSpotifyData;

  return (
    <View style={styles.container}>
      {/* Header with view mode toggle */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.viewModeButton} onPress={cycleViewMode}>
          <MaterialIcons name="remove-red-eye" size={responsiveSizes.icon.medium} color={COLORS.primary} />
          <Text style={styles.viewModeText}>{viewModeLabel}</Text>
        </TouchableOpacity>

        <View style={styles.profileCounter}>
          <Text style={styles.counterText}>
            {isSpotifyProfile ? 'Your Spotify Profile' : `Profile ${currentIndex + 1} / ${totalProfiles}`}
          </Text>
        </View>
      </View>

      {/* Profile Card - Wrapped in container to constrain dimensions */}
      <View style={styles.cardContainer}>
        {viewMode === 'low' ? (
          // Low detail: Full screen, no scroll (Tinder-style)
          <View style={styles.cardFullScreen}>
            <ProfileCardLow user={currentProfile.user} spotifyData={currentProfile.spotify} />
          </View>
        ) : (
          // High/Mid detail: Scrollable content
          <ScrollView style={styles.cardScrollView} showsVerticalScrollIndicator={false}>
            {viewMode === 'high' && (
              <ProfileCardHigh user={currentProfile.user} spotifyData={currentProfile.spotify} />
            )}
            {viewMode === 'mid' && (
              <ProfileCardMid user={currentProfile.user} spotifyData={currentProfile.spotify} />
            )}
          </ScrollView>
        )}

        {/* Floating Action Buttons Overlay */}
        <View style={styles.floatingButtonsContainer}>
          {/* Dislike Button - Bottom Left */}
          <TouchableOpacity
            style={[styles.floatingActionButton, styles.passButton]}
            onPress={handlePass}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="close" size={responsiveSizes.icon.xlarge} color={COLORS.error} />
          </TouchableOpacity>

          {/* Like Button - Bottom Right */}
          <TouchableOpacity
            style={[styles.floatingActionButton, styles.likeButton]}
            onPress={handleLike}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="heart" size={responsiveSizes.icon.xlarge} color={COLORS.success} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
