import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ApiResponse } from '@/types';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: 'Unauthorized. Please log in first.' },
      { status: 401 }
    );
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('doctor_appointments')
    .select('*')
    .eq('user_id', user.id)
    .order('appointment_date', { ascending: true });

  if (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResponse>({
    success: true,
    data,
    message: 'Appointments retrieved successfully',
  });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: 'Unauthorized. Please log in first.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const {
      doctor_name,
      specialty,
      clinic_name,
      clinic_location,
      appointment_date,
      is_followup = false,
      remind_before_minutes = 30,
      notes,
      report_url,
    } = body;

    if (!doctor_name || !appointment_date) {
      return NextResponse.json<ApiResponse>(
        { success: false, data: null, message: 'Missing doctor name or appointment date' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    const insertPayload: any = {
      user_id: user.id,
      doctor_name,
      specialty,
      clinic_name,
      clinic_location,
      appointment_date,
      is_followup,
      remind_before_minutes: parseInt(remind_before_minutes, 10) || 30,
      notes,
      report_url,
      notification_sent: false,
    };

    const { data, error } = await adminClient
      .from('doctor_appointments')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      return NextResponse.json<ApiResponse>(
        { success: false, data: null, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data,
      message: 'Appointment created successfully',
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
