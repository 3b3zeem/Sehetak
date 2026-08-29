-- Seed data for development
-- Create default test profiles and medications

INSERT INTO public.profiles (id, username, full_name, email, role, locale, breakfast_time, lunch_time, dinner_time)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin', 'System Admin', 'admin@sehetak.com', 'admin', 'en', '08:00:00', '14:00:00', '20:00:00'),
  ('00000000-0000-0000-0000-000000000002', 'sarah_m', 'Sarah Mahmoud', 'sarah@example.com', 'patient', 'ar', '08:30:00', '14:30:00', '21:00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.medications (id, user_id, name, med_type, dosage, frequency_mode, interval_hours, start_time, meal_anchor, meal_offset_minutes, stock_count, low_stock_threshold, is_active, notes)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'Panadol Extra', 'pill', '500mg', 'interval', 8, '08:00:00', null, 30, 24, 5, true, 'Take after eating'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'Glucophage', 'pill', '850mg', 'meal_anchored', null, null, 'lunch', 30, 4, 10, true, 'Take right before meal'),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000002', 'Ventolin', 'inhaler', '2 puffs', 'custom_times', null, '12:00:00', null, 0, 15, 3, true, 'As needed for shortness of breath')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.doctor_appointments (id, user_id, doctor_name, specialty, clinic_name, clinic_location, appointment_date, is_followup, remind_before_minutes, notes)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000002', 'Dr. Ahmed Zaki', 'Cardiology', 'Heart Care Center', 'Building B, 3rd Floor', NOW() + INTERVAL '2 days', false, 60, 'Bring recent ECG results'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000002', 'Dr. Mona Hassan', 'Endocrinology', 'Wellness Clinic', 'Medical City Tower 1', NOW() + INTERVAL '7 days', true, 30, 'Blood sugar logs review')
ON CONFLICT (id) DO NOTHING;
