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

interface UniversityVerificationStepProps {
  formData: {
    university: string;
    academic_field: string;
    academic_year: string;
    student_email: string;
  };
  updateFormData: (updates: Partial<UniversityVerificationStepProps['formData']>) => void;
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
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isEditingUniversity, setIsEditingUniversity] = useState(false);
  const [editedUniversity, setEditedUniversity] = useState('');

  const isValidStudentEmail = (email: string): boolean => {
    // Basic validation - check for common student email patterns
    const studentEmailPatterns = [
      /@.*\.edu$/i,
      /@gatech\.edu$/i,
      /@emory\.edu$/i,
      /@uga\.edu$/i,
      /@gsu\.edu$/i,
    ];
    
    return studentEmailPatterns.some(pattern => pattern.test(email));
  };

  const extractUniversityFromEmail = (email: string): string => {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return '';

    // Comprehensive map of email domains to university names
    const domainMap: Record<string, string> = {
      // Georgia Universities
      'gatech.edu': 'Georgia Institute of Technology',
      'emory.edu': 'Emory University',
      'uga.edu': 'University of Georgia',
      'gsu.edu': 'Georgia State University',
      'kennesaw.edu': 'Kennesaw State University',
      'georgiasouthern.edu': 'Georgia Southern University',
      'georgiacollege.edu': 'Georgia College & State University',
      'valdosta.edu': 'Valdosta State University',
      'westga.edu': 'University of West Georgia',
      
      // Other common universities
      'mit.edu': 'Massachusetts Institute of Technology',
      'harvard.edu': 'Harvard University',
      'stanford.edu': 'Stanford University',
      'berkeley.edu': 'University of California, Berkeley',
      'ucla.edu': 'University of California, Los Angeles',
      'usc.edu': 'University of Southern California',
      'nyu.edu': 'New York University',
      'columbia.edu': 'Columbia University',
      'yale.edu': 'Yale University',
      'princeton.edu': 'Princeton University',
      'cornell.edu': 'Cornell University',
      'upenn.edu': 'University of Pennsylvania',
      'uchicago.edu': 'University of Chicago',
      'northwestern.edu': 'Northwestern University',
      'umich.edu': 'University of Michigan',
      'uiuc.edu': 'University of Illinois Urbana-Champaign',
      'utexas.edu': 'University of Texas at Austin',
      'tamu.edu': 'Texas A&M University',
      'vt.edu': 'Virginia Tech',
      'ufl.edu': 'University of Florida',
      'fsu.edu': 'Florida State University',
      'miami.edu': 'University of Miami',
      'ncsu.edu': 'North Carolina State University',
      'unc.edu': 'University of North Carolina',
      'duke.edu': 'Duke University',
      'wfu.edu': 'Wake Forest University',
      'udel.edu': 'University of Delaware',
      'rutgers.edu': 'Rutgers University',
      'temple.edu': 'Temple University',
      'psu.edu': 'Pennsylvania State University',
      'cmu.edu': 'Carnegie Mellon University',
      'pitt.edu': 'University of Pittsburgh',
      'osu.edu': 'Ohio State University',
      'case.edu': 'Case Western Reserve University',
      'msu.edu': 'Michigan State University',
      'wisc.edu': 'University of Wisconsin',
      'uiowa.edu': 'University of Iowa',
      'uoregon.edu': 'University of Oregon',
      'washington.edu': 'University of Washington',
      'asu.edu': 'Arizona State University',
      'uaz.edu': 'University of Arizona',
      'colorado.edu': 'University of Colorado',
      'cu.edu': 'University of Colorado',
    };

    // Check exact match first
    if (domainMap[domain]) {
      return domainMap[domain];
    }

    // If it's a .edu domain but not in our map, try to format it nicely
    if (domain.endsWith('.edu')) {
      const parts = domain.split('.');
      if (parts.length >= 2) {
        // Remove .edu and format the domain name
        const domainName = parts.slice(0, -1).join('.');
        // Capitalize each word
        const formatted = domainName
          .split('.')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return formatted + ' University';
      }
    }

    return '';
  };

  const handleVerifyEmail = async () => {
    if (!formData.student_email.trim()) {
      Alert.alert('Error', 'Please enter your student email address.');
      return;
    }

    if (!isValidStudentEmail(formData.student_email)) {
      Alert.alert(
        'Invalid Email',
        'Please enter a valid student email address (.edu domain).'
      );
      return;
    }

    if (!formData.university) {
      Alert.alert(
        'University Not Detected',
        'We could not detect your university from your email. Please ensure you entered a valid .edu email address.'
      );
      return;
    }

    setIsVerifying(true);
    
    try {
      // Simulate verification process
      // In production, you'd send a verification email here
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsVerified(true);
      Alert.alert(
        'Verification Email Sent',
        'Please check your student email and click the verification link. Your university will be verified once you confirm.'
      );
    } catch (error) {
      console.error('Error verifying email:', error);
      Alert.alert('Error', 'Failed to send verification email. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Verification',
      'You can always verify your university later from your profile settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Skip', onPress: () => {} },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <MaterialIcons name="school" size={48} color={COLORS.primary} />
        <Text style={styles.title}>University Verification</Text>
        <Text style={styles.description}>
          Verify your student status to connect with others at your university. This is optional but helps you find better matches!
        </Text>
      </View>

      {/* Student Email */}
      <View style={styles.section}>
        <Input
          label="Student Email Address *"
          placeholder="your.name@university.edu"
          value={formData.student_email}
          onChangeText={(text) => {
            updateFormData({ student_email: text });
            setIsVerified(false);
            
            // Auto-detect university from email domain
            if (isValidStudentEmail(text)) {
              const detectedUniversity = extractUniversityFromEmail(text);
              if (detectedUniversity) {
                updateFormData({ university: detectedUniversity });
              }
            } else {
              // Clear university if email is invalid or incomplete
              updateFormData({ university: '' });
            }
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isVerified}
        />
        
        {/* Auto-detected University Display */}
        {formData.university && isValidStudentEmail(formData.student_email) && !isEditingUniversity && (
          <View style={styles.universityDisplay}>
            <MaterialIcons name="school" size={20} color={COLORS.primary} />
            <View style={styles.universityInfo}>
              <Text style={styles.universityLabel}>Detected University</Text>
              <Text style={styles.universityName}>{formData.university}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setEditedUniversity(formData.university);
                setIsEditingUniversity(true);
              }}
              style={styles.editButton}
            >
              <MaterialIcons name="edit" size={18} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Edit University Input */}
        {isEditingUniversity && (
          <View style={styles.editUniversityContainer}>
            <Input
              label="University Name"
              placeholder="Enter university name"
              value={editedUniversity}
              onChangeText={setEditedUniversity}
              autoCapitalize="words"
            />
            <View style={styles.editActions}>
              <TouchableOpacity
                onPress={() => {
                  setIsEditingUniversity(false);
                  setEditedUniversity('');
                }}
                style={[styles.editActionButton, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (editedUniversity.trim()) {
                    updateFormData({ university: editedUniversity.trim() });
                  }
                  setIsEditingUniversity(false);
                  setEditedUniversity('');
                }}
                style={[styles.editActionButton, styles.saveButton]}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {formData.student_email && isValidStudentEmail(formData.student_email) && !isVerified && (
          <Button
            title="Send Verification Email"
            onPress={handleVerifyEmail}
            loading={isVerifying}
            fullWidth
            style={styles.verifyButton}
          />
        )}
        {isVerified && (
          <View style={styles.verifiedBadge}>
            <MaterialIcons name="check-circle" size={20} color={COLORS.success} />
            <Text style={styles.verifiedText}>
              Verification email sent! Check your inbox.
            </Text>
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

