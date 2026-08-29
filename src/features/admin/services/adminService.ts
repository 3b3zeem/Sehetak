import { AdminOverviewStats, ProfileRow, MedicationRow, DoctorAppointmentRow, ApiResponse } from '@/types';

export const adminService = {
  async getOverviewStats(): Promise<AdminOverviewStats> {
    const res = await fetch('/api/admin/overview');
    const json: ApiResponse<AdminOverviewStats> = await res.json();
    if (!json.success || !json.data) {
      throw new Error(json.message || 'Failed to fetch admin overview stats');
    }
    return json.data;
  },

  async getUsers(search: string = ''): Promise<ProfileRow[]> {
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(search)}`);
    const json: ApiResponse<ProfileRow[]> = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Failed to fetch users');
    }
    return json.data || [];
  },

  async updateUserRole(userId: string, newRole: 'patient' | 'admin'): Promise<any> {
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole }),
    });
    const json: ApiResponse = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Failed to update user role');
    }
    return json.data;
  },

  async getGlobalMedications(search: string = ''): Promise<(MedicationRow & { profiles?: { username: string; full_name: string } })[]> {
    const res = await fetch(`/api/admin/medications?q=${encodeURIComponent(search)}`);
    const json: ApiResponse<any> = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Failed to fetch global medications');
    }
    return json.data || [];
  },

  async deleteMedication(id: string): Promise<string> {
    const res = await fetch(`/api/admin/medications/${id}`, { method: 'DELETE' });
    const json: ApiResponse = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Failed to delete medication');
    }
    return id;
  },

  async getGlobalAppointments(): Promise<(DoctorAppointmentRow & { profiles?: { username: string; full_name: string } })[]> {
    const res = await fetch('/api/admin/appointments');
    const json: ApiResponse<any> = await res.json();
    if (!json.success) {
      throw new Error(json.message || 'Failed to fetch appointments');
    }
    return json.data || [];
  },
};
