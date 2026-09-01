-- Migration: Senior Care & Medication Enhancement Features

-- 1. Add new columns to public.medications
ALTER TABLE public.medications 
ADD COLUMN IF NOT EXISTS pharmacy_name TEXT,
ADD COLUMN IF NOT EXISTS pharmacy_phone TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS pill_color TEXT,
ADD COLUMN IF NOT EXISTS pill_shape TEXT,
ADD COLUMN IF NOT EXISTS pill_size TEXT;

-- 2. Create public.daily_meal_logs table for dynamic meal anchoring
CREATE TABLE IF NOT EXISTS public.daily_meal_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date DATE DEFAULT CURRENT_DATE
);

-- Enable RLS on daily_meal_logs
ALTER TABLE public.daily_meal_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_meal_logs
DROP POLICY IF EXISTS "Users manage own meal logs" ON public.daily_meal_logs;
CREATE POLICY "Users manage own meal logs" ON public.daily_meal_logs
  FOR ALL USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Caregivers view linked patient meal logs" ON public.daily_meal_logs;
CREATE POLICY "Caregivers view linked patient meal logs" ON public.daily_meal_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.caregiver_links
      WHERE caregiver_links.patient_id = daily_meal_logs.patient_id
      AND caregiver_links.caregiver_id = auth.uid()
      AND caregiver_links.status = 'active'
    )
  );

-- Indexes for meal logs
CREATE INDEX IF NOT EXISTS idx_meal_logs_patient_date ON public.daily_meal_logs(patient_id, date);

-- 3. Add table to Supabase Realtime
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_meal_logs;
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
