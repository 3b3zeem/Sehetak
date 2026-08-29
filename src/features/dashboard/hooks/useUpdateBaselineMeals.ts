import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardService, MealAnchorsPayload } from '../services/dashboardService';
import { toast } from 'sonner';

export const useUpdateBaselineMeals = (defaultSuccessMsg?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MealAnchorsPayload) => dashboardService.updateBaselineMeals(payload),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || defaultSuccessMsg || 'Baseline meal times saved');
        queryClient.invalidateQueries({ queryKey: ['daily-timeline'] });
      } else {
        toast.error(response.message || 'Failed to save baseline meal times');
      }
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to save baseline meal times');
    },
  });
};
