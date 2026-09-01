'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalculatedDoseItem, ApiResponse, MedicationRow } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function useDailyTimeline() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  // Supabase Realtime Subscription for instantaneous updates across tabs/components
  useEffect(() => {
    const channel = supabase
      .channel('realtime-timeline-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medications' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dailyDoses'] });
        queryClient.invalidateQueries({ queryKey: ['medications'] });
        queryClient.invalidateQueries({ queryKey: ['authenticated-home-user'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'medication_logs' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dailyDoses'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_meal_logs' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dailyDoses'] });
        queryClient.invalidateQueries({ queryKey: ['dailyMealLogs'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        queryClient.invalidateQueries({ queryKey: ['authenticated-home-user'] });
        queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        queryClient.invalidateQueries({ queryKey: ['dailyDoses'] });
      })
      .subscribe();

    // Periodically evaluate and dispatch background reminders (Web Push & Telegram) every 30s
    fetch('/api/cron/dispatch-reminders').catch(() => {});
    const interval = setInterval(() => {
      fetch('/api/cron/dispatch-reminders').catch(() => {});
    }, 30 * 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [queryClient, supabase]);

  const timelineQuery = useQuery({
    queryKey: ['dailyDoses'],
    staleTime: 0,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<{ doses: CalculatedDoseItem[]; adherenceScore: number }> => {
      // Fetch user profile for baseline meal times
      const { data: { user } } = await supabase.auth.getUser();
      let breakfastTime = '08:00';
      let lunchTime = '14:00';
      let dinnerTime = '20:00';

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('breakfast_time, lunch_time, dinner_time')
          .eq('id', user.id)
          .single();
        if (profile) {
          if (profile.breakfast_time) breakfastTime = profile.breakfast_time;
          if (profile.lunch_time) lunchTime = profile.lunch_time;
          if (profile.dinner_time) dinnerTime = profile.dinner_time;
        }
      }

      // Fetch medications
      const resMeds = await fetch('/api/user/medications');
      const jsonMeds: ApiResponse<MedicationRow[]> = await resMeds.json();
      const meds = jsonMeds.data || [];

      // Fetch today's logged doses from Supabase medication_logs table
      const { data: logs } = await supabase.from('medication_logs').select('*');

      // Calculate doses for today
      const todayStr = new Date().toISOString().split('T')[0];
      const computedDoses: CalculatedDoseItem[] = meds.map((m, idx) => {
        const scheduledDate = new Date();

        if (m.frequency_mode === 'meal_anchored') {
          let baseMealTime = breakfastTime;
          if (m.meal_anchor === 'lunch') baseMealTime = lunchTime;
          if (m.meal_anchor === 'dinner') baseMealTime = dinnerTime;

          const [mh, mm] = baseMealTime.split(':').map(Number);
          scheduledDate.setHours(mh || 8, mm || 0, 0, 0);

          if (m.meal_offset_minutes) {
            scheduledDate.setMinutes(scheduledDate.getMinutes() + m.meal_offset_minutes);
          }
        } else if (m.start_time) {
          const [sh, sm] = m.start_time.split(':');
          const hours = parseInt(sh, 10) || 8;
          const mins = parseInt(sm, 10) || 0;
          scheduledDate.setHours(hours, mins, 0, 0);
        } else {
          const scheduledHour = (idx * 4 + 8) % 24;
          scheduledDate.setHours(scheduledHour, 0, 0, 0);
        }

        const scheduledISO = scheduledDate.toISOString();
        const matchingLog = logs?.find((l) => {
          if (l.medication_id !== m.id) return false;
          const logTime = new Date(l.scheduled_for).getTime();
          const schedTime = scheduledDate.getTime();
          return Math.abs(logTime - schedTime) < 60000;
        });

        const status = matchingLog ? (matchingLog.status as 'taken' | 'skipped' | 'pending') : 'pending';

        return {
          id: `computed-${m.id}-${todayStr}`,
          medication_id: m.id,
          medication_name: m.name,
          med_type: m.med_type,
          dosage: m.dosage,
          scheduled_for: scheduledISO,
          status,
          stock_count: m.stock_count,
          low_stock_threshold: m.low_stock_threshold,
          pharmacy_phone: m.pharmacy_phone,
          pharmacy_name: m.pharmacy_name,
          image_url: m.image_url,
          pill_color: m.pill_color,
          pill_shape: m.pill_shape,
          pill_size: m.pill_size,
          notes: m.notes,
        };
      });

      const total = computedDoses.length;
      const taken = computedDoses.filter((d) => d.status === 'taken').length;
      const score = total > 0 ? Math.round((taken / total) * 100) : 100;

      return { doses: computedDoses, adherenceScore: score };
    },
  });

  const toggleDoseMutation = useMutation({
    mutationFn: async ({
      medication_id,
      scheduled_for,
      status,
    }: {
      medication_id: string;
      scheduled_for: string;
      status: 'taken' | 'skipped' | 'pending';
    }) => {
      const res = await fetch('/api/user/logs/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medication_id, scheduled_for, status }),
      });
      const json: ApiResponse = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to update dose');
      return json.data;
    },
    // Optimistic Update
    onMutate: async ({ medication_id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['dailyDoses'] });
      const previousData = queryClient.getQueryData<{ doses: CalculatedDoseItem[]; adherenceScore: number }>(['dailyDoses']);

      if (previousData) {
        const newDoses = previousData.doses.map((d) =>
          d.medication_id === medication_id ? { ...d, status } : d
        );
        const takenCount = newDoses.filter((d) => d.status === 'taken').length;
        const newScore = newDoses.length > 0 ? Math.round((takenCount / newDoses.length) * 100) : 100;

        queryClient.setQueryData(['dailyDoses'], {
          doses: newDoses,
          adherenceScore: newScore,
        });
      }

      return { previousData };
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['dailyDoses'], context.previousData);
      }
      toast.error(err.message || 'Failed to toggle dose');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyDoses'] });
      queryClient.invalidateQueries({ queryKey: ['medications'] });
    },
  });

  return {
    doses: timelineQuery.data?.doses || [],
    adherenceScore: timelineQuery.data?.adherenceScore ?? 100,
    isLoading: timelineQuery.isLoading,
    toggleDose: toggleDoseMutation.mutate,
  };
}
