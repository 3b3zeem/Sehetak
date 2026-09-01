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
    .from('medications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResponse>({
    success: true,
    data,
    message: 'Medications retrieved successfully',
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
      name,
      med_type = 'pill',
      dosage,
      frequency_mode,
      interval_hours,
      start_time,
      meal_anchor,
      meal_offset_minutes = 30,
      stock_count = 0,
      low_stock_threshold = 5,
      notes,
      pharmacy_name,
      pharmacy_phone,
      image_url,
      pill_color,
      pill_shape,
      pill_size,
    } = body;

    if (!name || !dosage || !frequency_mode) {
      return NextResponse.json<ApiResponse>(
        { success: false, data: null, message: 'Missing required medication fields' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    const insertPayload: any = {
      user_id: user.id,
      name,
      med_type,
      dosage,
      frequency_mode,
      interval_hours: interval_hours ? parseInt(interval_hours, 10) : null,
      start_time,
      meal_anchor,
      meal_offset_minutes: meal_offset_minutes ? parseInt(meal_offset_minutes, 10) : 30,
      stock_count: stock_count ? parseInt(stock_count, 10) : 0,
      low_stock_threshold: low_stock_threshold ? parseInt(low_stock_threshold, 10) : 5,
      notes,
      pharmacy_name,
      pharmacy_phone,
      image_url,
      pill_color,
      pill_shape,
      pill_size,
    };

    const { data, error } = await adminClient
      .from('medications')
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
      message: 'Medication added successfully',
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
