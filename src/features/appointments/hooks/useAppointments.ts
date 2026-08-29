'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DoctorAppointmentRow, ApiResponse } from '@/types';
import { toast } from 'sonner';

export function useAppointments() {
  const queryClient = useQueryClient();

  const appointmentsQuery = useQuery({
    queryKey: ['appointments'],
    queryFn: async (): Promise<DoctorAppointmentRow[]> => {
      const res = await fetch('/api/user/appointments');
      const json: ApiResponse<DoctorAppointmentRow[]> = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to fetch appointments');
      return json.data || [];
    },
  });

  const addAppointmentMutation = useMutation({
    mutationFn: async (newAppt: Partial<DoctorAppointmentRow>) => {
      const res = await fetch('/api/user/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppt),
      });
      const json: ApiResponse<DoctorAppointmentRow> = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to add appointment');
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment scheduled successfully');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error scheduling appointment');
    },
  });

  return {
    appointments: appointmentsQuery.data || [],
    isLoading: appointmentsQuery.isLoading,
    addAppointment: addAppointmentMutation.mutateAsync,
    isAdding: addAppointmentMutation.isPending,
  };
}
