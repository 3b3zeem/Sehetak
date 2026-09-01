import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ApiResponse } from '@/types';

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
    const { medication_id, scheduled_for, status } = await req.json();

    if (!medication_id || !scheduled_for || !status) {
      return NextResponse.json<ApiResponse>(
        { success: false, data: null, message: 'Missing log params' },
        { status: 400 }
      );
    }

    const { data: existingLog } = await adminClient
      .from('medication_logs')
      .select('*')
      .eq('medication_id', medication_id)
      .eq('scheduled_for', scheduled_for)
      .eq('user_id', user.id)
      .maybeSingle();

    let logResult;
    if (existingLog) {
      const { data, error } = await adminClient
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
      const insertPayload = {
        user_id: user.id,
        medication_id,
        scheduled_for,
        status,
        taken_at: status === 'taken' ? new Date().toISOString() : null,
      };

      const { data, error } = await adminClient
        .from('medication_logs')
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;
      logResult = data;
    }

    // Deduct stock if taken
    if (status === 'taken') {
      const { data: med } = await adminClient
        .from('medications')
        .select('stock_count')
        .eq('id', medication_id)
        .single();

      if (med && med.stock_count > 0) {
        await adminClient
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
