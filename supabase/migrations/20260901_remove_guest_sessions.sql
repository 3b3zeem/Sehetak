-- Migration: Remove Anonymous Guest Sessions & Restore Strict User Authentication

-- Step 1: Drop dependent RLS policies first to avoid PostgreSQL dependency errors
DROP POLICY IF EXISTS "Users and guests manage push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users manage own push subscriptions" ON public.push_subscriptions;

DROP POLICY IF EXISTS "Users and guests manage medications" ON public.medications;
DROP POLICY IF EXISTS "Users manage own medications" ON public.medications;

DROP POLICY IF EXISTS "Users and guests manage intake logs" ON public.medication_logs;
DROP POLICY IF EXISTS "Users manage own logs" ON public.medication_logs;

DROP POLICY IF EXISTS "Users and guests manage meal logs" ON public.daily_meal_logs;
DROP POLICY IF EXISTS "Users manage own meal logs" ON public.daily_meal_logs;

DROP POLICY IF EXISTS "Users and guests manage appointments" ON public.doctor_appointments;
DROP POLICY IF EXISTS "Users manage own appointments" ON public.doctor_appointments;

-- Step 2: Delete guest-only records from tables where user_id / patient_id is NULL
DELETE FROM public.medications WHERE user_id IS NULL;
DELETE FROM public.medication_logs WHERE user_id IS NULL;
DELETE FROM public.daily_meal_logs WHERE patient_id IS NULL;
DELETE FROM public.doctor_appointments WHERE user_id IS NULL;
DELETE FROM public.push_subscriptions WHERE user_id IS NULL;

-- Step 3: Drop the guest_sessions table entirely
DROP TABLE IF EXISTS public.guest_sessions CASCADE;

-- Step 4: Drop guest_device_id columns with CASCADE
ALTER TABLE public.push_subscriptions DROP COLUMN IF EXISTS guest_device_id CASCADE;
ALTER TABLE public.medications DROP COLUMN IF EXISTS guest_device_id CASCADE;
ALTER TABLE public.medication_logs DROP COLUMN IF EXISTS guest_device_id CASCADE;
ALTER TABLE public.daily_meal_logs DROP COLUMN IF EXISTS guest_device_id CASCADE;
ALTER TABLE public.doctor_appointments DROP COLUMN IF EXISTS guest_device_id CASCADE;

-- Step 5: Enforce NOT NULL on user_id / patient_id
ALTER TABLE public.push_subscriptions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.medications ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.medication_logs ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.daily_meal_logs ALTER COLUMN patient_id SET NOT NULL;
ALTER TABLE public.doctor_appointments ALTER COLUMN user_id SET NOT NULL;

-- Step 6: Create clean RLS policies for authenticated users strictly
CREATE POLICY "Users manage own push subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own medications" ON public.medications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own logs" ON public.medication_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own meal logs" ON public.daily_meal_logs
  FOR ALL USING (auth.uid() = patient_id);

CREATE POLICY "Users manage own appointments" ON public.doctor_appointments
  FOR ALL USING (auth.uid() = user_id);
