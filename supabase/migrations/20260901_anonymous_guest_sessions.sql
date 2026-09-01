-- Migration: Anonymous Guest Sessions & Telegram Magic Link (Zero-Friction Onboarding)

-- 1. Create public.guest_sessions table
CREATE TABLE IF NOT EXISTS public.guest_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  guest_device_id TEXT UNIQUE NOT NULL,
  telegram_chat_id BIGINT,
  telegram_temp_token TEXT UNIQUE,
  telegram_temp_token_expires_at TIMESTAMP WITH TIME ZONE,
  magic_login_token TEXT UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_guest_sessions_device ON public.guest_sessions(guest_device_id);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_tg_token ON public.guest_sessions(telegram_temp_token);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_magic_token ON public.guest_sessions(magic_login_token);

-- Enable RLS
ALTER TABLE public.guest_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read/insert for guest sessions" ON public.guest_sessions;
CREATE POLICY "Allow public read/insert for guest sessions" ON public.guest_sessions
  FOR ALL USING (true);

-- 2. Modify push_subscriptions to allow nullable user_id and optional guest_device_id
ALTER TABLE public.push_subscriptions
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS guest_device_id TEXT;

CREATE INDEX IF NOT EXISTS idx_push_guest_device ON public.push_subscriptions(guest_device_id);

-- RLS Policy for push_subscriptions with guest support (Drop any previous variant)
DROP POLICY IF EXISTS "Users manage own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users and guests manage push subscriptions" ON public.push_subscriptions;

CREATE POLICY "Users and guests manage push subscriptions" ON public.push_subscriptions
  FOR ALL USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (guest_device_id IS NOT NULL)
  );

-- 3. Modify medications, medication_logs, daily_meal_logs, and doctor_appointments to optionally support guest_device_id
ALTER TABLE public.medications
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS guest_device_id TEXT;

ALTER TABLE public.medication_logs
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS guest_device_id TEXT;

ALTER TABLE public.daily_meal_logs
  ALTER COLUMN patient_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS guest_device_id TEXT;

ALTER TABLE public.doctor_appointments
  ALTER COLUMN user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS guest_device_id TEXT;

CREATE INDEX IF NOT EXISTS idx_medications_guest ON public.medications(guest_device_id);
CREATE INDEX IF NOT EXISTS idx_logs_guest ON public.medication_logs(guest_device_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_guest ON public.daily_meal_logs(guest_device_id);
CREATE INDEX IF NOT EXISTS idx_appointments_guest ON public.doctor_appointments(guest_device_id);

-- Update RLS policies to allow guest access safely (Drop all existing policy names first)
DROP POLICY IF EXISTS "Users manage own medications" ON public.medications;
DROP POLICY IF EXISTS "Users and guests manage medications" ON public.medications;
CREATE POLICY "Users and guests manage medications" ON public.medications
  FOR ALL USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (guest_device_id IS NOT NULL)
  );

DROP POLICY IF EXISTS "Users manage own logs" ON public.medication_logs;
DROP POLICY IF EXISTS "Users and guests manage intake logs" ON public.medication_logs;
CREATE POLICY "Users and guests manage intake logs" ON public.medication_logs
  FOR ALL USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (guest_device_id IS NOT NULL)
  );

DROP POLICY IF EXISTS "Users manage own meal logs" ON public.daily_meal_logs;
DROP POLICY IF EXISTS "Users and guests manage meal logs" ON public.daily_meal_logs;
CREATE POLICY "Users and guests manage meal logs" ON public.daily_meal_logs
  FOR ALL USING (
    (auth.uid() IS NOT NULL AND auth.uid() = patient_id) OR
    (guest_device_id IS NOT NULL)
  );

DROP POLICY IF EXISTS "Users manage own appointments" ON public.doctor_appointments;
DROP POLICY IF EXISTS "Users and guests manage appointments" ON public.doctor_appointments;
CREATE POLICY "Users and guests manage appointments" ON public.doctor_appointments
  FOR ALL USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (guest_device_id IS NOT NULL)
  );
