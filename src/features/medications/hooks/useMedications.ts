'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MedicationRow } from '@/types';
import { medicationService } from '../services/medicationService';
import { toast } from 'sonner';

export function useMedications() {
  const queryClient = useQueryClient();

  const medicationsQuery = useQuery({
    queryKey: ['medications'],
    queryFn: async (): Promise<MedicationRow[]> => {
      const json = await medicationService.getMedications();
      if (!json.success) throw new Error(json.message || 'Failed to fetch medications');
      return json.data || [];
    },
  });

  const addMedicationMutation = useMutation({
    mutationFn: async (newMed: Partial<MedicationRow>) => {
      const json = await medicationService.addMedication(newMed);
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
      const json = await medicationService.updateMedication(id, data);
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
      const json = await medicationService.deleteMedication(id);
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

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const json = await medicationService.uploadPhoto(file);
      if (!json.success || !json.data) throw new Error(json.message || 'Failed to upload photo');
      return json.data.url;
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload photo');
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
    uploadPhoto: uploadPhotoMutation.mutateAsync,
    isAdding: addMedicationMutation.isPending,
    isUpdating: updateMedicationMutation.isPending,
    isUploading: uploadPhotoMutation.isPending,
  };
}
