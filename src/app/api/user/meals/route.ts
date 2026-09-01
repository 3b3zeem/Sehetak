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
  const todayStr = new Date().toISOString().split('T')[0];

  const { data, error } = await adminClient
    .from('daily_meal_logs')
    .select('*')
    .eq('patient_id', user.id)
    .eq('date', todayStr)
    .order('logged_at', { ascending: false });

  if (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResponse>({
    success: true,
    data,
    message: 'Meal logs retrieved successfully',
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

  const adminClient = createAdminClient();

  try {
    const { meal_type } = await req.json();

    if (!meal_type || !['breakfast', 'lunch', 'dinner'].includes(meal_type)) {
      return NextResponse.json<ApiResponse>(
        { success: false, data: null, message: 'Invalid meal_type' },
        { status: 400 }
      );
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toTimeString().slice(0, 8);

    const insertPayload = {
      patient_id: user.id,
      meal_type,
      logged_at: new Date().toISOString(),
      date: todayStr,
    };

    // 1. Insert daily meal log
    const { data: mealLog, error: mealErr } = await adminClient
      .from('daily_meal_logs')
      .insert(insertPayload)
      .select()
      .single();

    if (mealErr) {
      return NextResponse.json<ApiResponse>(
        { success: false, data: null, message: mealErr.message },
        { status: 500 }
      );
    }

    // 2. Dynamically update profile baseline meal time
    const profileUpdate: { breakfast_time?: string; lunch_time?: string; dinner_time?: string } = {};
    if (meal_type === 'breakfast') profileUpdate.breakfast_time = nowTimeStr;
    if (meal_type === 'lunch') profileUpdate.lunch_time = nowTimeStr;
    if (meal_type === 'dinner') profileUpdate.dinner_time = nowTimeStr;

    await adminClient
      .from('profiles')
      .update(profileUpdate)
      .eq('id', user.id);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: mealLog,
      message: 'Meal logged successfully',
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
