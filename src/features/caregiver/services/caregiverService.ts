import { createClient } from '@/lib/supabase/client';
import { ApiResponse, CaregiverLinkRow, CaregiverPatientOverview } from '@/types';

export const caregiverService = {
  /**
   * Generates a unique invite code for an elderly patient to share with their caregiver.
   */
  async generateInviteCode(patientLabel: string = 'الوالد/الوالدة'): Promise<ApiResponse<string>> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc('generate_caregiver_invite', {
        p_patient_label: patientLabel,
      });

      if (error) {
        return { success: false, data: null, message: error.message };
      }

      return {
        success: true,
        data: data as string,
        message: 'تم توليد كود الدعوة بنجاح',
      };
    } catch (err: any) {
      return {
        success: false,
        data: null,
        message: err.message || 'حدث خطأ أثناء توليد الكود',
      };
    }
  },

  /**
   * Accepts an invite code entered by a caregiver to link with a patient.
   */
  async acceptInviteCode(code: string): Promise<ApiResponse<{ patient_id: string; patient_name: string; label: string }>> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc('accept_caregiver_invite', {
        p_invite_code: code,
      });

      if (error) {
        return { success: false, data: null, message: error.message };
      }

      const result = data as any;
      return {
        success: true,
        data: {
          patient_id: result.patient_id,
          patient_name: result.patient_name,
          label: result.label,
        },
        message: `تم ربط الحساب بنجاح لـ رعاية ${result.patient_name}`,
      };
    } catch (err: any) {
      return {
        success: false,
        data: null,
        message: err.message || 'فشل عملية ربط الحساب',
      };
    }
  },

  /**
   * Fetches active caregiver links where the current user is a caregiver.
   */
  async getLinkedPatientsOverview(): Promise<ApiResponse<CaregiverPatientOverview[]>> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, data: null, message: 'غير مسجل الدخول' };

      // 1. Fetch active links
      const { data: links, error: linksError } = await supabase
        .from('caregiver_links')
        .select(`
          id,
          patient_id,
          patient_label,
          created_at,
          profiles:patient_id ( full_name )
        `)
        .eq('caregiver_id', user.id)
        .eq('status', 'active');

      if (linksError) {
        return { success: false, data: null, message: linksError.message };
      }

      if (!links || links.length === 0) {
        return { success: true, data: [] };
      }

      // Deduplicate links by patient_id to prevent redundant UI card renders
      const uniqueLinksMap = new Map<string, any>();
      for (const link of links) {
        if (!uniqueLinksMap.has(link.patient_id)) {
          uniqueLinksMap.set(link.patient_id, link);
        }
      }

      const uniqueLinks = Array.from(uniqueLinksMap.values());
      const overviews: CaregiverPatientOverview[] = [];
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      for (const link of uniqueLinks) {
        const patientId = link.patient_id;
        const patientName = (link.profiles as any)?.full_name || 'الوالد/الوالدة';
        const patientLabel = link.patient_label || 'الوالد/الوالدة';

        // Fetch medication logs for patient today
        const { data: logs } = await supabase
          .from('medication_logs')
          .select(`
            id,
            medication_id,
            scheduled_for,
            taken_at,
            status,
            medications ( name, med_type, dosage, stock_count, low_stock_threshold )
          `)
          .eq('user_id', patientId)
          .gte('scheduled_for', todayStart.toISOString())
          .lte('scheduled_for', todayEnd.toISOString())
          .order('scheduled_for', { ascending: true });

        let formattedLogs = (logs || []).map((l: any) => ({
          id: l.id,
          medication_id: l.medication_id,
          medication_name: l.medications?.name || 'دواء',
          med_type: l.medications?.med_type || 'pill',
          dosage: l.medications?.dosage || '1 حبة',
          scheduled_for: l.scheduled_for,
          status: l.status as 'taken' | 'skipped' | 'pending',
          taken_at: l.taken_at,
          stock_count: l.medications?.stock_count || 0,
          low_stock_threshold: l.medications?.low_stock_threshold || 5,
        }));

        // Fallback: If no intake logs have been logged for today, fetch active medications from medications cabinet directly
        if (formattedLogs.length === 0) {
          const { data: activeMeds } = await supabase
            .from('medications')
            .select('*')
            .eq('user_id', patientId)
            .eq('is_active', true);

          if (activeMeds && activeMeds.length > 0) {
            formattedLogs = activeMeds.map((m: any) => ({
              id: m.id,
              medication_id: m.id,
              medication_name: m.name,
              med_type: m.med_type || 'pill',
              dosage: m.dosage || '1 dose',
              scheduled_for: new Date().toISOString(),
              status: 'pending' as const,
              taken_at: null,
              stock_count: m.stock_count || 0,
              low_stock_threshold: m.low_stock_threshold || 5,
            }));
          }
        }

        const totalToday = formattedLogs.length;
        const takenToday = formattedLogs.filter((l) => l.status === 'taken').length;
        const pendingToday = formattedLogs.filter((l) => l.status === 'pending').length;
        const missedToday = formattedLogs.filter(
          (l) => l.status === 'pending' && new Date(l.scheduled_for).getTime() < Date.now() - 20 * 60 * 1000
        ).length;

        const adherencePercentage = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 100;

        overviews.push({
          linkId: link.id,
          patientId,
          patientName,
          patientLabel,
          adherencePercentage,
          totalToday,
          takenToday,
          pendingToday,
          missedToday,
          recentLogs: formattedLogs,
        });
      }

      return { success: true, data: overviews };
    } catch (err: any) {
      return { success: false, data: null, message: err.message || 'خطأ في جلب بيانات الرعاية' };
    }
  },

  /**
   * Fetches invite codes generated by the current patient.
   */
  async getMyInviteCodes(): Promise<ApiResponse<CaregiverLinkRow[]>> {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, data: null, message: 'غير مسجل الدخول' };

      const { data, error } = await supabase
        .from('caregiver_links')
        .select(`
          *,
          profiles:caregiver_id ( full_name, email, username )
        `)
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });

      if (error) return { success: false, data: null, message: error.message };

      const formatted = (data || []).map((item: any) => ({
        ...item,
        caregiver_name: item.profiles?.full_name || item.profiles?.username || null,
        caregiver_email: item.profiles?.email || null,
      }));

      return { success: true, data: formatted as CaregiverLinkRow[] };
    } catch (err: any) {
      return { success: false, data: null, message: err.message };
    }
  },

  /**
   * Cancels / deletes a caregiver link.
   */
  async deleteLink(linkId: string): Promise<ApiResponse<boolean>> {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('caregiver_links').delete().eq('id', linkId);

      if (error) return { success: false, data: null, message: error.message };

      return { success: true, data: true, message: 'تم إلغاء كفالة الرعاية بنجاح' };
    } catch (err: any) {
      return { success: false, data: null, message: err.message };
    }
  },
};
