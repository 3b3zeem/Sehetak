import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ApiResponse, AdminOverviewStats } from '@/types';

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();

  if (authErr || !user) {
    return NextResponse.json<ApiResponse>(
      { success: false, data: null, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Admin Guard Check
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

  // Fetch counts & stats
  const { count: totalUsers } = await adminClient
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: totalActiveMedications } = await adminClient
    .from('medications')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { data: logs } = await adminClient
    .from('medication_logs')
    .select('status');

  const totalLogs = logs?.length || 0;
  const takenLogs = logs?.filter((l) => l.status === 'taken').length || 0;
  const platformAdherenceRate = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 100;

  const { count: totalRemindersDispatched } = await adminClient
    .from('push_subscriptions')
    .select('*', { count: 'exact', head: true });

  const { data: recentUsers } = await adminClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  const stats: AdminOverviewStats = {
    totalUsers: totalUsers || 0,
    totalActiveMedications: totalActiveMedications || 0,
    platformAdherenceRate,
    totalRemindersDispatched: (totalRemindersDispatched || 0) * 12 + takenLogs, // estimated total alerts
    recentUsers: recentUsers || [],
  };

  return NextResponse.json<ApiResponse<AdminOverviewStats>>({
    success: true,
    data: stats,
    message: 'Admin overview stats fetched successfully',
  });
}
