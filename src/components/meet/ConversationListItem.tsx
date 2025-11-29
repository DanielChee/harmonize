import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import { getBadgesFromReview, type Review } from '@utils/mockMeets';
import React, { useState } from 'react';
import { Alert, Image, Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { MatchedUser } from '../../features/meet';

export default function ConversationListItem({
  matchedUser,
  onSubmitReview,
  onUnmatch,
}: {
  matchedUser: MatchedUser;
  onSubmitReview: (id: string, review: Review) => void;
  onUnmatch: (id: string) => void;
}) {
  const [modalVisible, setModalVisible] = useState(false);

  // Scores for the three 1–5 star questions
  const [q1, setQ1] = useState(0);
  const [q2, setQ2] = useState(0);
  const [q3, setQ3] = useState(0);

  // Harmonize yes/no
  const [wouldMeetAgain, setWouldMeetAgain] = useState<boolean | null>(null);

  const concertDate = new Date(matchedUser.concertDate);
  const isFuture = concertDate > new Date();

  const handleUnmatch = () => {
    Alert.alert(
      "Unmatch",
      `Are you sure you want to unmatch with ${matchedUser.name}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unmatch",
          style: "destructive",
          onPress: () => {
            onUnmatch(matchedUser.id);
            setModalVisible(false);
          }
        }
      ]
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => setModalVisible(true)}
      >
        <Image source={{ uri: matchedUser.avatar }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.name}>{matchedUser.name}, {matchedUser.age}</Text>
          <Text style={styles.city}>{matchedUser.city}</Text>
          <Text style={styles.dateText}>{matchedUser.concertDate}</Text>

          {matchedUser.review ? (
            <View style={styles.reviewSummary}>
              <Text style={styles.reviewed}>Reviewed</Text>
              <View style={styles.badgeContainer}>
                {getBadgesFromReview(matchedUser.review).q1Badge && (
                  <Text style={styles.badgeText}>{getBadgesFromReview(matchedUser.review).q1Badge?.emoji}</Text>
                )}
                {getBadgesFromReview(matchedUser.review).q2Badge && (
                  <Text style={styles.badgeText}>{getBadgesFromReview(matchedUser.review).q2Badge?.emoji}</Text>
                )}
                {getBadgesFromReview(matchedUser.review).q3Badge && (
                  <Text style={styles.badgeText}>{getBadgesFromReview(matchedUser.review).q3Badge?.emoji}</Text>
                )}
                {matchedUser.review.wouldMeetAgain && (
                  <Text style={styles.badgeText}>🤝</Text>
                )}
              </View>
            </View>
          ) : isFuture ? (
            <Text style={styles.future}>Concert upcoming</Text>
          ) : (
            <Text style={styles.unreviewed}>Tap to review</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* --- MODAL --- */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Image source={{ uri: matchedUser.avatar }} style={styles.modalAvatar} />
            <Text style={styles.modalName}>{matchedUser.name}</Text>

            {/* --- FUTURE MATCH: texting only --- */}
            {isFuture ? (
              <>
                <Text style={styles.modalCity}>{matchedUser.city}</Text>
                <Text style={styles.modalPhone}>📞 {matchedUser.phoneNumber}</Text>

                <TouchableOpacity
                  style={styles.textButton}
                  onPress={() => {
                    const smsUrl = `sms:${matchedUser.phoneNumber}`;
                    Linking.canOpenURL(smsUrl).then(s => s && Linking.openURL(smsUrl));
                  }}
                >
                  <Text style={styles.textButtonText}>Text in iMessage</Text>
                </TouchableOpacity>
              </>
            ) : matchedUser.review ? (
              <>
                <Text style={styles.commentText}>
                  Enjoyment: {matchedUser.review.q1}/5{'\n'}
                  Reliability: {matchedUser.review.q2}/5{'\n'}
                  Communication: {matchedUser.review.q3}/5{'\n'}
                  Harmonized: {matchedUser.review.wouldMeetAgain ? '🎵 Yes' : '💤 No'}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.modalPrompt}>Answer these questions</Text>

                {[
                  { label: 'Enjoyment', value: q1, setter: setQ1 },
                  { label: 'Reliability', value: q2, setter: setQ2 },
                  { label: 'Communication', value: q3, setter: setQ3 },
                ].map((q, i) => (
                  <View key={i} style={{ marginVertical: 4 }}>
                    <Text style={styles.question}>{q.label}:</Text>

                    <View style={styles.starRow}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <TouchableOpacity key={s} onPress={() => q.setter(s)}>
                          <Text style={[styles.star, q.value >= s && styles.starSelected]}>★</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}

                <Text style={styles.harmonizeQuestion}>
                  Did you harmonize with {matchedUser.name}?
                </Text>

                <View style={styles.harmonizeOptions}>
                  <TouchableOpacity
                    onPress={() => setWouldMeetAgain(true)}
                    style={[styles.optionButton, wouldMeetAgain === true && styles.optionSelected]}
                  >
                    <Text style={styles.optionText}>🎵 Yes</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setWouldMeetAgain(false)}
                    style={[styles.optionButton, wouldMeetAgain === false && styles.optionSelected]}
                  >
                    <Text style={styles.optionText}>💤 No</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.submitButton, { marginTop: 16, paddingVertical: 12 }]}
                  onPress={() => {
                    const review: Review = {
                      type: 'B',
                      q1,
                      q2,
                      q3,
                      wouldMeetAgain: !!wouldMeetAgain,
                    };

                    onSubmitReview(matchedUser.id, review);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.submitText, { fontSize: 16 }]}>Submit</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>

            {/* Unmatch Button */}
            <TouchableOpacity onPress={handleUnmatch} style={styles.unmatchButton}>
              <Text style={styles.unmatchText}>Unmatch</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: SPACING.lg, marginVertical: 6, borderRadius: 10, padding: SPACING.md },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: SPACING.md },
  info: { flex: 1 },
  name: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: TYPOGRAPHY.weights.semibold, color: COLORS.text.primary },
  city: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.secondary },
  dateText: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.text.secondary },
  unreviewed: { color: COLORS.primary, fontSize: TYPOGRAPHY.sizes.sm },
  reviewed: { color: COLORS.text.secondary, fontSize: TYPOGRAPHY.sizes.sm },
  future: { color: '#888', fontSize: TYPOGRAPHY.sizes.sm },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  modalBox: { width: '90%', backgroundColor: COLORS.background, borderRadius: 14, padding: SPACING.xl, alignItems: 'center' },

  modalAvatar: { width: 90, height: 90, borderRadius: 45, marginBottom: SPACING.sm },
  modalName: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold, color: COLORS.text.primary },
  modalCity: { color: COLORS.text.secondary, fontSize: TYPOGRAPHY.sizes.sm, marginBottom: 4 },
  modalPhone: { fontSize: TYPOGRAPHY.sizes.base, color: COLORS.text.primary, marginTop: 6 },

  modalPrompt: { marginTop: 10, color: COLORS.text.secondary, fontWeight: '600' },

  question: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.primary, textAlign: 'center', marginBottom: 2 },

  starRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 4 },
  star: { fontSize: 26, color: '#ccc', marginHorizontal: 4 },
  starSelected: { color: '#FFD700' },

  harmonizeQuestion: { fontSize: 16, fontWeight: '600', color: COLORS.text.primary, textAlign: 'center', marginTop: 8 },
  harmonizeOptions: { flexDirection: 'row', justifyContent: 'center', marginVertical: 8 },

  optionButton: { borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 18, marginHorizontal: 8 },
  optionSelected: { backgroundColor: COLORS.primary },
  optionText: { color: COLORS.text.primary, fontSize: 15, fontWeight: '500' },

  commentText: { color: COLORS.text.secondary, textAlign: 'center', marginVertical: 12 },

  submitButton: { marginTop: 10, backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 24, alignSelf: 'center' },
  submitText: { color: COLORS.text.inverse, fontWeight: TYPOGRAPHY.weights.bold },

  closeButton: { marginTop: 14 },
  closeText: { color: COLORS.primary, fontWeight: '600' },

  textButton: { backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 18, borderRadius: 8, marginTop: SPACING.sm },
  textButtonText: { color: COLORS.text.inverse, fontWeight: TYPOGRAPHY.weights.semibold },

  reviewSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: SPACING.sm,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.sizes.base,
  },
  unmatchButton: {
    marginTop: SPACING.lg,
    padding: SPACING.sm,
  },
  unmatchText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  }
});
