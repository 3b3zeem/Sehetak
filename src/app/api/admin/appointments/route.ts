import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ApiResponse } from '@/types';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: 'Forbidden: Admin access required' },
      { status: 403 }
    );
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from('doctor_appointments')
    .select('*, profiles(username, full_name)')
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
    message: 'Global appointments fetched successfully',
  });
}
