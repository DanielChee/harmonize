import { supabase } from './supabase';

export interface VerificationResult {
  success: boolean;
  message?: string;
}

/**
 * Simulate sending a verification email.
 * In a real app, this would call an Edge Function to send an email via SendGrid/AWS SES.
 * Here, we'll log the code and store it in the database.
 */
export async function sendVerificationEmail(userId: string, email: string): Promise<VerificationResult> {
  try {
    // 1. Validate .edu email
    if (!email.endsWith('.edu')) {
      return { success: false, message: 'Please enter a valid .edu email address.' };
    }

    // 2. Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Store in database
    const { error } = await supabase
      .from('verifications')
      .insert({
        user_id: userId,
        email,
        code,
        status: 'pending',
        verification_type: 'university'
      });

    if (error) {
      console.error('Error creating verification:', error);
      return { success: false, message: 'Failed to start verification. Please try again.' };
    }

    // 4. "Send" email (Log it for the prototype)
    console.log(`[Verification] Code for ${email}: ${code}`);
    
    return { success: true, message: 'Verification code sent! (Check console logs for prototype)' };

  } catch (error) {
    console.error('Verification error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

/**
 * Verify the code entered by the user.
 */
export async function verifyCode(userId: string, email: string, code: string): Promise<VerificationResult> {
  try {
    // 1. Find the pending verification
    const { data, error } = await supabase
      .from('verifications')
      .select('*')
      .eq('user_id', userId)
      .eq('email', email)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return { success: false, message: 'Invalid or expired verification request.' };
    }

    // 2. Check code
    if (data.code !== code) {
      return { success: false, message: 'Incorrect verification code.' };
    }

    // 3. Mark as approved
    const { error: updateError } = await supabase
      .from('verifications')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', data.id);

    if (updateError) {
      return { success: false, message: 'Failed to confirm verification.' };
    }

    // 4. Update User Profile
    // Extract university domain/name (simple logic)
    const universityDomain = email.split('@')[1];
    await supabase
        .from('profiles')
        .update({ 
            is_verified: true,
            university: universityDomain // Simple heuristic, user can edit later
        })
        .eq('id', userId);

    return { success: true, message: 'University verified successfully!' };

  } catch (error) {
    console.error('Verification check error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
