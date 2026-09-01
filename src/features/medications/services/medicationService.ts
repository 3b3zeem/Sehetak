import { ApiResponse, MedicationRow } from '@/types';

export const medicationService = {
  async getMedications(): Promise<ApiResponse<MedicationRow[]>> {
    try {
      const res = await fetch('/api/user/medications');
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        data: null,
        message: err.message || 'Failed to fetch medications',
      };
    }
  },

  async addMedication(newMed: Partial<MedicationRow>): Promise<ApiResponse<MedicationRow>> {
    try {
      const res = await fetch('/api/user/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMed),
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        data: null,
        message: err.message || 'Failed to add medication',
      };
    }
  },

  async updateMedication(id: string, data: Partial<MedicationRow>): Promise<ApiResponse<MedicationRow>> {
    try {
      const res = await fetch(`/api/user/medications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        data: null,
        message: err.message || 'Failed to update medication',
      };
    }
  },

  async deleteMedication(id: string): Promise<ApiResponse<null>> {
    try {
      const res = await fetch(`/api/user/medications/${id}`, { method: 'DELETE' });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        data: null,
        message: err.message || 'Failed to delete medication',
      };
    }
  },

  async uploadPhoto(file: File): Promise<ApiResponse<{ url: string }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/user/upload', {
        method: 'POST',
        body: formData,
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        data: null,
        message: err.message || 'Failed to upload photo',
      };
    }
  },
};
