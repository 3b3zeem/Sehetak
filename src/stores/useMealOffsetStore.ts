import { create } from 'zustand';

interface MealTimeShiftState {
  breakfastTime: string; // e.g. "08:00"
  lunchTime: string; // e.g. "14:00"
  dinnerTime: string; // e.g. "20:00"
  setMealTimes: (times: { breakfastTime?: string; lunchTime?: string; dinnerTime?: string }) => void;
  resetDefaults: () => void;
}

export const useMealOffsetStore = create<MealTimeShiftState>((set) => ({
  breakfastTime: '08:00',
  lunchTime: '14:00',
  dinnerTime: '20:00',
  setMealTimes: (times) => set((state) => ({ ...state, ...times })),
  resetDefaults: () => set({ breakfastTime: '08:00', lunchTime: '14:00', dinnerTime: '20:00' }),
}));
