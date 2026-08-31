import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { email, otpCode, newPassword } = await request.json();

    if (!email || !otpCode || !newPassword) {
      return NextResponse.json(
        { success: false, data: null, message: 'Email, OTP code, and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, data: null, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otpCode.trim();
    const supabaseAdmin = createAdminClient();

    // 1. Fetch user by email
    const { data: usersData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (userError || !usersData?.users) {
      return NextResponse.json(
        { success: false, data: null, message: 'User not found' },
        { status: 404 }
      );
    }

    const targetUser = usersData.users.find((u) => u.email?.toLowerCase() === cleanEmail);

    if (!targetUser) {
      return NextResponse.json(
        { success: false, data: null, message: 'Invalid email address' },
        { status: 404 }
      );
    }

    // 2. Check OTP in password_resets table
    const { data: resetRecords } = await (supabaseAdmin as any)
      .from('password_resets')
      .select('*')
      .eq('email', cleanEmail)
      .eq('otp_code', cleanOtp)
      .order('created_at', { ascending: false })
      .limit(1);

    let isValidOtp = false;

    if (resetRecords && resetRecords.length > 0) {
      const record = resetRecords[0];
      if (new Date(record.expires_at).getTime() > Date.now()) {
        isValidOtp = true;
      }
    }

    // Fallback check in user_metadata
    if (!isValidOtp) {
      const metaOtp = targetUser.user_metadata?.reset_otp;
      const metaExpires = targetUser.user_metadata?.reset_otp_expires;

      if (
        metaOtp &&
        metaOtp === cleanOtp &&
        metaExpires &&
        new Date(metaExpires).getTime() > Date.now()
      ) {
        isValidOtp = true;
      }
    }

    if (!isValidOtp) {
      return NextResponse.json(
        { success: false, data: null, message: 'Invalid or expired OTP verification code' },
        { status: 400 }
      );
    }

    // 3. Update password via Supabase Auth Admin
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
      password: newPassword,
      user_metadata: {
        ...targetUser.user_metadata,
        reset_otp: null,
        reset_otp_expires: null,
      },
    });

    if (updateError) {
      return NextResponse.json(
        { success: false, data: null, message: updateError.message },
        { status: 500 }
      );
    }

    // 4. Cleanup password_resets table for this email
    await (supabaseAdmin as any).from('password_resets').delete().eq('email', cleanEmail);

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Password updated successfully',
    });
  } catch (error: any) {
    console.error('Reset password API error:', error);
    return NextResponse.json(
      { success: false, data: null, message: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}
