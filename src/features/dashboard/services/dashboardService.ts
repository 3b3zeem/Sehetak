import { ApiResponse } from '@/types';

export interface MealAnchorsPayload {
  breakfast_time: string;
  lunch_time: string;
  dinner_time: string;
}

export const dashboardService = {
  async updateBaselineMeals(payload: MealAnchorsPayload): Promise<ApiResponse> {
    try {
      const res = await fetch('/api/user/meals/anchor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        data: null,
        message: err?.message || 'Network error updating baseline meals',
      };
    }
  },
};
