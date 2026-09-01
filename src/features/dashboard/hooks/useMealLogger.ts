'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiResponse, DailyMealLogRow } from '@/types';
import { useMealOffsetStore } from '@/stores/useMealOffsetStore';
import { toast } from 'sonner';

export function useMealLogger() {
  const queryClient = useQueryClient();
  const { setMealTimes } = useMealOffsetStore();

  const mealLogsQuery = useQuery({
    queryKey: ['dailyMealLogs'],
    queryFn: async (): Promise<DailyMealLogRow[]> => {
      const res = await fetch('/api/user/meals');
      const json: ApiResponse<DailyMealLogRow[]> = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to fetch meal logs');
      return json.data || [];
    },
  });

  const logMealMutation = useMutation({
    mutationFn: async (meal_type: 'breakfast' | 'lunch' | 'dinner') => {
      const res = await fetch('/api/user/meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal_type }),
      });
      const json: ApiResponse<DailyMealLogRow> = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to log meal');
      return json.data;
    },
    onSuccess: (data, mealType) => {
      const nowTimeStr = new Date().toTimeString().slice(0, 5); // HH:mm
      if (mealType === 'breakfast') setMealTimes({ breakfastTime: nowTimeStr });
      if (mealType === 'lunch') setMealTimes({ lunchTime: nowTimeStr });
      if (mealType === 'dinner') setMealTimes({ dinnerTime: nowTimeStr });

      queryClient.invalidateQueries({ queryKey: ['dailyMealLogs'] });
      queryClient.invalidateQueries({ queryKey: ['dailyDoses'] });
      queryClient.invalidateQueries({ queryKey: ['authenticated-home-user'] });
      
      const localizedMeal = 
        mealType === 'breakfast' ? 'الإفطار' : mealType === 'lunch' ? 'الغداء' : 'العشاء';
      toast.success(`تم تسجيل وجبة ${localizedMeal} وتحديث جدول الأدوية تلقائياً`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'حدث خطأ أثناء تسجيل الوجبة');
    },
  });

  return {
    mealLogs: mealLogsQuery.data || [],
    isLoading: mealLogsQuery.isLoading,
    logMeal: logMealMutation.mutateAsync,
    isLogging: logMealMutation.isPending,
    activeMealType: logMealMutation.isPending ? logMealMutation.variables : null,
  };
}
