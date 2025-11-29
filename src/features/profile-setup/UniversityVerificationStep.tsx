/**
 * Step 4: University Verification (Optional)
 * Allows user to verify their student status with university email
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import { Input } from '@components/common/Input';
import { Button } from '@components/common/Button';
import { MaterialIcons } from '@expo/vector-icons';
import { sendVerificationEmail, verifyCode } from '@services/supabase/verification';
import { useUserStore } from '@store';

interface UniversityVerificationStepProps {
  formData: {
    university: string;
    academic_field: string;
    academic_year: string;
  };
  updateFormData: (updates: Partial<UniversityVerificationStepProps['formData']>) => void;
  isVerified?: boolean;
}

const ACADEMIC_YEAR_OPTIONS = [
  'Freshman',
  'Sophomore',
  'Junior',
  'Senior',
  'Graduate Student',
];

export const UniversityVerificationStep: React.FC<UniversityVerificationStepProps> = ({
  formData,
  updateFormData,
  isVerified: initialVerified = false,
}) => {
  const { session } = useUserStore();
  const [eduEmail, setEduEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [isVerified, setIsVerified] = useState(initialVerified);
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!eduEmail.trim().endsWith('.edu')) {
      Alert.alert('Invalid Email', 'Please enter a valid .edu email address.');
      return;
    }

    if (!session?.user?.id) {
      Alert.alert('Error', 'User session not found.');
      return;
    }

    setLoading(true);
    const result = await sendVerificationEmail(session.user.id, eduEmail.trim());
    setLoading(false);

    if (result.success) {
      setVerificationSent(true);
      Alert.alert('Code Sent', result.message);
    } else {
      Alert.alert('Error', result.message || 'Failed to send code.');
    }
  };

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
        Alert.alert('Missing Code', 'Please enter the verification code.');
        return;
    }

    if (!session?.user?.id) return;

    setLoading(true);
    const result = await verifyCode(session.user.id, eduEmail.trim(), verificationCode.trim());
    setLoading(false);

    if (result.success) {
      setIsVerified(true);
      const domain = eduEmail.split('@')[1];
      // Simple heuristic for university name, ideally backend does this
      const uniName = domain.split('.')[0].toUpperCase(); 
      updateFormData({ university: uniName });
      Alert.alert('Success', 'University verified successfully!');
    } else {
      Alert.alert('Verification Failed', result.message || 'Invalid code.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <MaterialIcons name="school" size={48} color={COLORS.primary} />
        <Text style={styles.title}>Academic Information</Text>
        <Text style={styles.description}>
          Share your academic details to help connect with peers from your university.
        </Text>
      </View>

      {/* University Verification Section */}
      <View style={styles.section}>
        <Text style={styles.label}>University Verification (Optional)</Text>
        
        {!isVerified ? (
            <>
                <Input
                    placeholder="yourname@university.edu"
                    value={eduEmail}
                    onChangeText={setEduEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!verificationSent}
                />
                
                {!verificationSent ? (
                    <Button 
                        title="Send Verification Code"
                        onPress={handleSendCode}
                        loading={loading}
                        disabled={loading || !eduEmail}
                        style={styles.verifyButton}
                    />
                ) : (
                    <View style={styles.codeSection}>
                        <Text style={styles.subLabel}>Enter the code sent to your email:</Text>
                        <Input
                            placeholder="123456"
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                        <Button 
                            title="Verify Code"
                            onPress={handleVerify}
                            loading={loading}
                            disabled={loading || !verificationCode}
                            style={styles.verifyButton}
                        />
                        <TouchableOpacity onPress={() => setVerificationSent(false)} style={styles.resendLink}>
                            <Text style={styles.resendText}>Change email or resend</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </>
        ) : (
            <View style={styles.verifiedBadge}>
                <MaterialIcons name="check-circle" size={24} color={COLORS.success} />
                <Text style={styles.verifiedText}>Verified: {eduEmail}</Text>
            </View>
        )}
      </View>

      {/* Academic Field */}
      <Input
        label="Academic Field / Major"
        placeholder="e.g., Computer Science, Business, Biology"
        value={formData.academic_field}
        onChangeText={(text) => updateFormData({ academic_field: text })}
        autoCapitalize="words"
        maxLength={100}
      />

      {/* Academic Year */}
      <View style={styles.section}>
        <Text style={styles.label}>Academic Year</Text>
        <View style={styles.optionsGrid}>
          {ACADEMIC_YEAR_OPTIONS.map((year) => (
            <OptionButton
              key={year}
              label={year}
              selected={formData.academic_year === year}
              onPress={() => updateFormData({ academic_year: year })}
            />
          ))}
        </View>
      </View>

      <Text style={styles.skipHint}>
        You can skip this step and verify your university later from your profile.
      </Text>
    </ScrollView>
  );
};

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const OptionButton: React.FC<OptionButtonProps> = ({ label, selected, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.optionButton, selected && styles.optionButtonSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
  },
  codeSection: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resendLink: {
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.sm,
    textDecorationLine: 'underline',
  },
  verifyButton: {
    marginTop: SPACING.sm,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.success + '20',
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  universityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  universityInfo: {
    flex: 1,
  },
  universityLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs / 2,
  },
  universityName: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  editButton: {
    padding: SPACING.xs,
  },
  editUniversityContainer: {
    marginTop: SPACING.md,
  },
  editActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  editActionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.inverse,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  optionTextSelected: {
    color: COLORS.text.inverse,
  },
  skipHint: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
});

