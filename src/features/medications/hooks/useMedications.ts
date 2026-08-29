'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MedicationRow, ApiResponse } from '@/types';
import { toast } from 'sonner';

export function useMedications() {
  const queryClient = useQueryClient();

  const medicationsQuery = useQuery({
    queryKey: ['medications'],
    queryFn: async (): Promise<MedicationRow[]> => {
      const res = await fetch('/api/user/medications');
      const json: ApiResponse<MedicationRow[]> = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to fetch medications');
      return json.data || [];
    },
  });

  const addMedicationMutation = useMutation({
    mutationFn: async (newMed: Partial<MedicationRow>) => {
      const res = await fetch('/api/user/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMed),
      });
      const json: ApiResponse<MedicationRow> = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to add medication');
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.invalidateQueries({ queryKey: ['dailyDoses'] });
      toast.success('Medication added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error adding medication');
    },
  });

  const updateMedicationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MedicationRow> }) => {
      const res = await fetch(`/api/user/medications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json: ApiResponse<MedicationRow> = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to update medication');
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.invalidateQueries({ queryKey: ['dailyDoses'] });
      toast.success('Medication updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error updating medication');
    },
  });

  const deleteMedicationMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/user/medications/${id}`, { method: 'DELETE' });
      const json: ApiResponse = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to delete medication');
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications'] });
      queryClient.invalidateQueries({ queryKey: ['dailyDoses'] });
      toast.success('Medication deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Error deleting medication');
    },
  });

  return {
    medications: medicationsQuery.data || [],
    isLoading: medicationsQuery.isLoading,
    isError: medicationsQuery.isError,
    error: medicationsQuery.error,
    addMedication: addMedicationMutation.mutateAsync,
    updateMedication: updateMedicationMutation.mutateAsync,
    deleteMedication: deleteMedicationMutation.mutateAsync,
    isAdding: addMedicationMutation.isPending,
    isUpdating: updateMedicationMutation.isPending,
  };
}
