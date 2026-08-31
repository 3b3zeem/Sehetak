import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSehetakResetPasswordEmailHtml } from '@/lib/email/templates';
import { sendSehetakEmail } from '@/lib/email/mailer';

export async function POST(request: Request) {
  try {
    const { email, locale = 'ar' } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, data: null, message: 'Email address is required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabaseAdmin = createAdminClient();

    // 1. Check if user exists with this email
    const { data: usersData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError) {
      console.error('User list error:', userError);
    }

    const existingUser = usersData?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);

    if (!existingUser) {
      // Return success to avoid email enumeration security attacks
      return NextResponse.json({
        success: true,
        data: null,
        message: 'If the email exists in our records, a reset code was sent.',
      });
    }

    // 2. Generate real 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes expiry

    // Delete any existing reset codes for this email
    await (supabaseAdmin as any).from('password_resets').delete().eq('email', cleanEmail);

    // Save reset code to password_resets table
    const { error: insertError } = await (supabaseAdmin as any).from('password_resets').insert({
      email: cleanEmail,
      otp_code: otpCode,
      expires_at: expiresAt,
    });

    if (insertError) {
      console.error('Password reset insert error:', insertError);
      // Fallback: save OTP to user_metadata
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        user_metadata: {
          ...existingUser.user_metadata,
          reset_otp: otpCode,
          reset_otp_expires: expiresAt,
        },
      });
    }

    // 3. Generate Sehetak branded HTML email in user's language
    const subject = locale === 'ar' ? '🔐 كود استعادة كلمة المرور - صحتك' : '🔐 Password Reset Code - Sehetak';
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://go-sehetak.vercel.app'}/${locale}/reset-password?email=${encodeURIComponent(cleanEmail)}`;
    
    const htmlContent = getSehetakResetPasswordEmailHtml(locale as 'ar' | 'en', otpCode, resetUrl);

    // 4. Send email via Nodemailer
    await sendSehetakEmail({
      to: cleanEmail,
      subject,
      html: htmlContent,
    });

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Password reset OTP code sent via email successfully',
    });
  } catch (error: any) {
    console.error('Forgot password API error:', error);
    return NextResponse.json(
      { success: false, data: null, message: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
