import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ApiResponse } from '@/types';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { breakfast_time, lunch_time, dinner_time } = await req.json();

    const { data, error } = await supabase
      .from('profiles')
      .update({
        breakfast_time,
        lunch_time,
        dinner_time,
      })
      .eq('id', user.id)
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
      message: 'Meal times updated successfully',
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
