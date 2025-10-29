import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import type { MockUser, Review } from '@utils/mockMeets';
import React, { useState } from 'react';
import { Image, Linking, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ConversationListItem({
  matchedUser,
  reviewVersion,
  onSubmitReview,
}: {
  matchedUser: MockUser;
  reviewVersion: 'A' | 'B';
  onSubmitReview: (id: string, review: any) => void;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // Version B fields
  const [q1, setQ1] = useState(0);
  const [q2, setQ2] = useState(0);
  const [q3, setQ3] = useState(0);
  const [wouldMeetAgain, setWouldMeetAgain] = useState<boolean | null>(null);

  const concertDate = new Date(matchedUser.concertDate);
  const isFuture = concertDate > new Date();
  const isPastUnreviewed = !isFuture && !matchedUser.review;

  // -------- logging helper --------
  function logReviewEvent(
    name: string,
    action: 'open' | 'submit',
    version?: 'A' | 'B',
    comment?: string,
    ratings?: { q1: number; q2: number; q3: number; wouldMeetAgain: boolean | null }
  ) {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const clock = '🕒';
    const person = '🧑';
    const open = '🟢';
    const check = '✅';

    let log = `
***********************
${clock} Timestamp: ${time}
${person} Reviewee: ${name}
${action === 'open' ? open + ' Action: Open Review Modal' : check + ' Action: Submit Review'}
`;

    if (action === 'submit' && version === 'A' && comment) {
      log += `🗒️ Comment: ${comment}\n`;
    } else if (action === 'submit' && version === 'B' && ratings) {
      log += `⭐ Enjoyment: ${ratings.q1}/5
⭐ Reliability: ${ratings.q2}/5
⭐ Communication: ${ratings.q3}/5
🎵 Harmonize: ${
        ratings.wouldMeetAgain === null
          ? '—'
          : ratings.wouldMeetAgain
          ? 'Yes'
          : 'No'
      }\n`;
    }

    log += '***********************';
    console.log(log);
  }

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => {
          if (isPastUnreviewed) logReviewEvent(matchedUser.name, 'open', reviewVersion);
          setModalVisible(true);
        }}
      >
        <Image source={{ uri: matchedUser.avatar }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.name}>
            {matchedUser.name}, {matchedUser.age}
          </Text>
          <Text style={styles.city}>{matchedUser.city}</Text>
          <Text style={styles.dateText}>{matchedUser.concertDate}</Text>
          {matchedUser.review ? (
            <Text style={styles.reviewed}>Reviewed</Text>
          ) : isFuture ? (
            <Text style={styles.future}>Concert upcoming</Text>
          ) : (
            <Text style={styles.unreviewed}>Tap to review</Text>
          )}
        </View>
      </TouchableOpacity>

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

            {/* --- FUTURE (texting) --- */}
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
                {matchedUser.review.type === 'A' ? (
                  <>
                    <Text style={styles.reviewedText}>⭐ {matchedUser.review.rating}</Text>
                    <Text style={styles.commentText}>{matchedUser.review.comment}</Text>
                  </>
                ) : (
                  <Text style={styles.commentText}>
                    Enjoyment: {matchedUser.review.q1}/5{'\n'}
                    Reliability: {matchedUser.review.q2}/5{'\n'}
                    Communication: {matchedUser.review.q3}/5{'\n'}
                    Harmonized: {matchedUser.review.wouldMeetAgain ? '🎵 Yes' : '💤 No'}
                  </Text>
                )}
              </>
            ) : reviewVersion === 'A' ? (
              <>
                <Text style={styles.modalPrompt}>Rate your match</Text>
                <View style={styles.starRow}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <TouchableOpacity key={s} onPress={() => setRating(s)}>
                      <Text style={[styles.star, rating >= s && styles.starSelected]}>★</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Write a short comment..."
                  placeholderTextColor="#999"
                  multiline
                  value={comment}
                  onChangeText={setComment}
                />
                <TouchableOpacity
                  style={[styles.submitButton, { paddingVertical: 12 }]}
                  onPress={() => {
                    onSubmitReview(matchedUser.id, { type: 'A', rating, comment });
                    if (isPastUnreviewed)
                      logReviewEvent(matchedUser.name, 'submit', 'A', comment);
                    setModalVisible(false);
                  }}
                >
                  <Text style={[styles.submitText, { fontSize: 16 }]}>Submit</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalPrompt}>Answer these questions</Text>
                {[{ label: 'Enjoyment', v: q1, f: setQ1 },
                  { label: 'Reliability', v: q2, f: setQ2 },
                  { label: 'Communication', v: q3, f: setQ3 }].map((q, i) => (
                  <View key={i} style={{ marginVertical: 4 }}>
                    <Text style={styles.question}>{q.label}:</Text>
                    <View style={styles.starRow}>
                      {[1, 2, 3, 4, 5].map(s => (
                        <TouchableOpacity key={s} onPress={() => q.f(s)}>
                          <Text style={[styles.star, q.v >= s && styles.starSelected]}>★</Text>
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
                      wouldMeetAgain: Boolean(wouldMeetAgain),
                    };
                    onSubmitReview(matchedUser.id, review);
                    if (isPastUnreviewed)
                      logReviewEvent(matchedUser.name, 'submit', 'B', '', {
                        q1,
                        q2,
                        q3,
                        wouldMeetAgain,
                      });
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
  starRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 4 },
  star: { fontSize: 26, color: '#ccc', marginHorizontal: 4 },
  starSelected: { color: '#FFD700' },
  harmonizeQuestion: { fontSize: 16, fontWeight: '600', color: COLORS.text.primary, textAlign: 'center', marginTop: 8 },
  harmonizeOptions: { flexDirection: 'row', justifyContent: 'center', marginVertical: 8 },
  optionButton: { borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 18, marginHorizontal: 8 },
  optionSelected: { backgroundColor: COLORS.primary },
  optionText: { color: COLORS.text.primary, fontSize: 15, fontWeight: '500' },
  commentInput: { width: '100%', height: 60, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, padding: 8, textAlignVertical: 'top' },
  submitButton: { marginTop: 10, backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 24, alignSelf: 'center' },
  submitText: { color: COLORS.text.inverse, fontWeight: TYPOGRAPHY.weights.bold },
  reviewedText: { fontSize: 18, color: '#FFD700', marginVertical: 4 },
  commentText: { color: COLORS.text.secondary, textAlign: 'center', fontStyle: 'italic' },
  closeButton: { marginTop: 14 },
  closeText: { color: COLORS.primary, fontWeight: '600' },
  textButton: { backgroundColor: COLORS.primary, paddingVertical: 8, paddingHorizontal: 18, borderRadius: 8, marginTop: SPACING.sm },
  textButtonText: { color: COLORS.text.inverse, fontWeight: TYPOGRAPHY.weights.semibold },
  question: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.text.primary, textAlign: 'center' },
});
