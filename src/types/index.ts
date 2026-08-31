import { Database } from './database.types';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message?: string;
  errors?: string[] | Record<string, string>;
}

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type MedicationRow = Database['public']['Tables']['medications']['Row'];
export type MedicationInsert = Database['public']['Tables']['medications']['Insert'];
export type MedicationUpdate = Database['public']['Tables']['medications']['Update'];

export type MedicationLogRow = Database['public']['Tables']['medication_logs']['Row'];
export type MedicationLogInsert = Database['public']['Tables']['medication_logs']['Insert'];

export type DoctorAppointmentRow = Database['public']['Tables']['doctor_appointments']['Row'];
export type DoctorAppointmentInsert = Database['public']['Tables']['doctor_appointments']['Insert'];
export type DoctorAppointmentUpdate = Database['public']['Tables']['doctor_appointments']['Update'];

export type PushSubscriptionRow = Database['public']['Tables']['push_subscriptions']['Row'];

export interface CalculatedDoseItem {
  id: string; // log id or computed dose id
  medication_id: string;
  medication_name: string;
  med_type: MedicationRow['med_type'];
  dosage: string;
  scheduled_for: string; // ISO string
  status: 'taken' | 'skipped' | 'pending';
  notes?: string | null;
  stock_count: number;
  low_stock_threshold: number;
  taken_at?: string | null;
}

export interface AdminOverviewStats {
  totalUsers: number;
  totalActiveMedications: number;
  platformAdherenceRate: number;
  totalRemindersDispatched: number;
  recentUsers: ProfileRow[];
}

export type CaregiverLinkStatus = 'pending' | 'active' | 'rejected';

export interface CaregiverLinkRow {
  id: string;
  patient_id: string;
  caregiver_id: string | null;
  caregiver_name?: string | null;
  caregiver_email?: string | null;
  invite_code: string;
  patient_label: string;
  status: CaregiverLinkStatus;
  alert_delay_minutes: number;
  notify_push: boolean;
  notify_telegram: boolean;
  expires_at: string;
  created_at: string;
}

export interface CaregiverPatientOverview {
  linkId: string;
  patientId: string;
  patientName: string;
  patientLabel: string;
  adherencePercentage: number;
  totalToday: number;
  takenToday: number;
  pendingToday: number;
  missedToday: number;
  recentLogs: CalculatedDoseItem[];
}

