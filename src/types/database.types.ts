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
          created_at: string;
        };
        Insert: {
          id?: string;
          medication_id: string;
          user_id: string;
          scheduled_for: string;
          taken_at?: string | null;
          status?: LogStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          medication_id?: string;
          user_id?: string;
          scheduled_for?: string;
          taken_at?: string | null;
          status?: LogStatus;
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
