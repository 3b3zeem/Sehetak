-- Password Resets OTP Table
CREATE TABLE IF NOT EXISTS public.password_resets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by email & code
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON public.password_resets(email);

-- Enable RLS
ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role manages password resets"
  ON public.password_resets
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
