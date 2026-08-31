'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { caregiverService } from '../services/caregiverService';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export const CAREGIVER_QUERY_KEYS = {
  linkedPatients: ['caregiver', 'linked-patients'],
  myInviteCodes: ['caregiver', 'my-invite-codes'],
};

/**
 * Realtime subscription hook to instantly sync caregiver links and patient dose logs.
 * Uses a unique channel identifier per instance to prevent Supabase Realtime channel collisions.
 */
export function useCaregiverRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();
    const channelId = `caregiver-realtime-${Math.random().toString(36).substring(2, 9)}`;

    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'caregiver_links' },
        () => {
          queryClient.invalidateQueries({ queryKey: CAREGIVER_QUERY_KEYS.linkedPatients });
          queryClient.invalidateQueries({ queryKey: CAREGIVER_QUERY_KEYS.myInviteCodes });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'medication_logs' },
        () => {
          queryClient.invalidateQueries({ queryKey: CAREGIVER_QUERY_KEYS.linkedPatients });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'medications' },
        () => {
          queryClient.invalidateQueries({ queryKey: CAREGIVER_QUERY_KEYS.linkedPatients });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

export function useLinkedPatientsOverview() {
  useCaregiverRealtime();

  return useQuery({
    queryKey: CAREGIVER_QUERY_KEYS.linkedPatients,
    queryFn: async () => {
      const res = await caregiverService.getLinkedPatientsOverview();
      if (!res.success) throw new Error(res.message);
      return res.data || [];
    },
    staleTime: 1000 * 5,
    refetchInterval: 1000 * 10,
  });
}

export function useMyInviteCodes() {
  return useQuery({
    queryKey: CAREGIVER_QUERY_KEYS.myInviteCodes,
    queryFn: async () => {
      const res = await caregiverService.getMyInviteCodes();
      if (!res.success) throw new Error(res.message);
      return res.data || [];
    },
    staleTime: 1000 * 5,
    refetchInterval: 1000 * 10,
  });
}

export function useGenerateInviteCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (label?: string) => {
      const res = await caregiverService.generateInviteCode(label);
      if (!res.success) throw new Error(res.message);
      return res.data!;
    },
    onSuccess: (code) => {
      toast.success(`تم توليد كود الدعوة: ${code}`);
      queryClient.invalidateQueries({ queryKey: CAREGIVER_QUERY_KEYS.myInviteCodes });
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل توليد كود الدعوة');
    },
  });
}

export function useAcceptInviteCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      const res = await caregiverService.acceptInviteCode(code);
      if (!res.success) throw new Error(res.message);
      return res.data!;
    },
    onSuccess: (data) => {
      toast.success(`تم الربط بنجاح مع: ${data.patient_name}`);
      queryClient.invalidateQueries({ queryKey: CAREGIVER_QUERY_KEYS.linkedPatients });
      queryClient.invalidateQueries({ queryKey: CAREGIVER_QUERY_KEYS.myInviteCodes });
    },
    onError: (error: any) => {
      toast.error(error.message || 'كود غير صحيح أو منتهي الصلاحية');
    },
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      const res = await caregiverService.deleteLink(linkId);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      toast.success('تم إلغاء الربط بنجاح');
      queryClient.invalidateQueries({ queryKey: CAREGIVER_QUERY_KEYS.linkedPatients });
      queryClient.invalidateQueries({ queryKey: CAREGIVER_QUERY_KEYS.myInviteCodes });
    },
    onError: (error: any) => {
      toast.error(error.message || 'فشل إلغاء الربط');
    },
  });
}
