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
    const { medication_id, scheduled_for, status } = await req.json();

    if (!medication_id || !scheduled_for || !status) {
      return NextResponse.json<ApiResponse>(
        { success: false, data: null, message: 'Missing log params' },
        { status: 400 }
      );
    }

    // Check if log already exists
    const { data: existingLog } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('medication_id', medication_id)
      .eq('scheduled_for', scheduled_for)
      .single();

    let logResult;
    if (existingLog) {
      const { data, error } = await supabase
        .from('medication_logs')
        .update({
          status,
          taken_at: status === 'taken' ? new Date().toISOString() : null,
        })
        .eq('id', existingLog.id)
        .select()
        .single();

      if (error) throw error;
      logResult = data;
    } else {
      const { data, error } = await supabase
        .from('medication_logs')
        .insert({
          user_id: user.id,
          medication_id,
          scheduled_for,
          status,
          taken_at: status === 'taken' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      logResult = data;
    }

    // Deduct stock if taken
    if (status === 'taken') {
      const { data: med } = await supabase
        .from('medications')
        .select('stock_count')
        .eq('id', medication_id)
        .single();

      if (med && med.stock_count > 0) {
        await supabase
          .from('medications')
          .update({ stock_count: med.stock_count - 1 })
          .eq('id', medication_id);
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: logResult,
      message: `Dose status updated to ${status}`,
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
