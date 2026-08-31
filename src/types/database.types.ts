export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'patient' | 'admin';
export type MedicationType = 'pill' | 'syrup' | 'injection' | 'drops' | 'inhaler' | 'ointment';
export type FrequencyMode = 'interval' | 'meal_anchored' | 'custom_times';
export type LogStatus = 'taken' | 'skipped' | 'pending';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          email: string | null;
          role: UserRole;
          locale: string | null;
          breakfast_time: string | null;
          lunch_time: string | null;
          dinner_time: string | null;
          telegram_chat_id: number | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          email?: string | null;
          role?: UserRole;
          locale?: string | null;
          breakfast_time?: string | null;
          lunch_time?: string | null;
          dinner_time?: string | null;
          telegram_chat_id?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          email?: string | null;
          role?: UserRole;
          locale?: string | null;
          breakfast_time?: string | null;
          lunch_time?: string | null;
          dinner_time?: string | null;
          telegram_chat_id?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      medications: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          med_type: MedicationType;
          dosage: string;
          frequency_mode: FrequencyMode;
          interval_hours: number | null;
          start_time: string | null;
          meal_anchor: string | null;
          meal_offset_minutes: number | null;
          stock_count: number;
          low_stock_threshold: number;
          is_active: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          med_type?: MedicationType;
          dosage: string;
          frequency_mode: FrequencyMode;
          interval_hours?: number | null;
          start_time?: string | null;
          meal_anchor?: string | null;
          meal_offset_minutes?: number | null;
          stock_count?: number;
          low_stock_threshold?: number;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          med_type?: MedicationType;
          dosage?: string;
          frequency_mode?: FrequencyMode;
          interval_hours?: number | null;
          start_time?: string | null;
          meal_anchor?: string | null;
          meal_offset_minutes?: number | null;
          stock_count?: number;
          low_stock_threshold?: number;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'medications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      medication_logs: {
        Row: {
          id: string;
          medication_id: string;
          user_id: string;
          scheduled_for: string;
          taken_at: string | null;
          status: LogStatus;
          caregiver_notified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          medication_id: string;
          user_id: string;
          scheduled_for: string;
          taken_at?: string | null;
          status?: LogStatus;
          caregiver_notified_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          medication_id?: string;
          user_id?: string;
          scheduled_for?: string;
          taken_at?: string | null;
          status?: LogStatus;
          caregiver_notified_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'medication_logs_medication_id_fkey';
            columns: ['medication_id'];
            isOneToOne: false;
            referencedRelation: 'medications';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'medication_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      caregiver_links: {
        Row: {
          id: string;
          patient_id: string;
          caregiver_id: string | null;
          invite_code: string;
          patient_label: string;
          status: 'pending' | 'active' | 'rejected';
          alert_delay_minutes: number;
          notify_push: boolean;
          notify_telegram: boolean;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          caregiver_id?: string | null;
          invite_code: string;
          patient_label?: string;
          status?: 'pending' | 'active' | 'rejected';
          alert_delay_minutes?: number;
          notify_push?: boolean;
          notify_telegram?: boolean;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          caregiver_id?: string | null;
          invite_code?: string;
          patient_label?: string;
          status?: 'pending' | 'active' | 'rejected';
          alert_delay_minutes?: number;
          notify_push?: boolean;
          notify_telegram?: boolean;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'caregiver_links_patient_id_fkey';
            columns: ['patient_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'caregiver_links_caregiver_id_fkey';
            columns: ['caregiver_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      doctor_appointments: {
        Row: {
          id: string;
          user_id: string;
          doctor_name: string;
          specialty: string | null;
          clinic_name: string | null;
          clinic_location: string | null;
          appointment_date: string;
          is_followup: boolean;
          remind_before_minutes: number;
          notification_sent: boolean;
          notes: string | null;
          report_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          doctor_name: string;
          specialty?: string | null;
          clinic_name?: string | null;
          clinic_location?: string | null;
          appointment_date: string;
          is_followup?: boolean;
          remind_before_minutes?: number;
          notification_sent?: boolean;
          notes?: string | null;
          report_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          doctor_name?: string;
          specialty?: string | null;
          clinic_name?: string | null;
          clinic_location?: string | null;
          appointment_date?: string;
          is_followup?: boolean;
          remind_before_minutes?: number;
          notification_sent?: boolean;
          notes?: string | null;
          report_url?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'doctor_appointments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'push_subscriptions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      generate_caregiver_invite: {
        Args: {
          p_patient_label?: string;
        };
        Returns: string;
      };
      accept_caregiver_invite: {
        Args: {
          p_invite_code: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      user_role: UserRole;
      medication_type: MedicationType;
      frequency_mode: FrequencyMode;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
