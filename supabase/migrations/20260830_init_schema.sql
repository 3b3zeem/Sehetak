create extension if not exists "uuid-ossp";

-- Role enum
create type user_role as enum ('patient', 'admin');

-- 1. Profiles Table with Unique Username, Roles, and Baseline Times
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  email text,
  role user_role not null default 'patient',
  locale text default 'en',
  breakfast_time time default '08:00:00',
  lunch_time time default '14:00:00',
  dinner_time time default '20:00:00',
  telegram_chat_id bigint,
  created_at timestamp with time zone default now()
);

-- 2. Medications Table
create type medication_type as enum ('pill', 'syrup', 'injection', 'drops', 'inhaler', 'ointment');
create type frequency_mode as enum ('interval', 'meal_anchored', 'custom_times');

create table public.medications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  med_type medication_type not null default 'pill',
  dosage text not null,
  frequency_mode frequency_mode not null,
  interval_hours int,
  start_time time,
  meal_anchor text,
  meal_offset_minutes int default 30,
  stock_count int default 0,
  low_stock_threshold int default 5,
  is_active boolean default true,
  notes text,
  created_at timestamp with time zone default now()
);

-- 3. Intake Logs Table
create table public.medication_logs (
  id uuid default uuid_generate_v4() primary key,
  medication_id uuid references public.medications(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  scheduled_for timestamp with time zone not null,
  taken_at timestamp with time zone,
  status text check (status in ('taken', 'skipped', 'pending')) default 'pending',
  created_at timestamp with time zone default now()
);

-- 4. Doctor Appointments Table
create table public.doctor_appointments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  doctor_name text not null,
  specialty text,
  clinic_name text,
  clinic_location text,
  appointment_date timestamp with time zone not null,
  is_followup boolean default false,
  remind_before_minutes int default 30,
  notification_sent boolean default false,
  notes text,
  report_url text,
  created_at timestamp with time zone default now()
);

-- 5. Push Subscriptions Table
create table public.push_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone default now()
);

-- Helper function to check if caller is an admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.medications enable row level security;
alter table public.medication_logs enable row level security;
alter table public.doctor_appointments enable row level security;
alter table public.push_subscriptions enable row level security;

-- Profiles Policies
create policy "Users can view and update own profile" on public.profiles
  for all using (auth.uid() = id);
create policy "Admins have full access to profiles" on public.profiles
  for all using (public.is_admin());

-- Medications Policies (User isolated + Admin full access)
create policy "Users manage own medications" on public.medications
  for all using (auth.uid() = user_id);
create policy "Admins full access to all medications" on public.medications
  for all using (public.is_admin());

-- Intake Logs Policies
create policy "Users manage own logs" on public.medication_logs
  for all using (auth.uid() = user_id);
create policy "Admins full access to logs" on public.medication_logs
  for all using (public.is_admin());

-- Appointments Policies
create policy "Users manage own appointments" on public.doctor_appointments
  for all using (auth.uid() = user_id);
create policy "Admins full access to appointments" on public.doctor_appointments
  for all using (public.is_admin());

-- Push Subscriptions Policies
create policy "Users manage own push subscriptions" on public.push_subscriptions
  for all using (auth.uid() = user_id);

-- Performance Indexes
create index idx_profiles_username on public.profiles(username);
create index idx_profiles_role on public.profiles(role);
create index idx_medications_user on public.medications(user_id);
create index idx_logs_user_scheduled on public.medication_logs(user_id, scheduled_for);
create index idx_appointments_user_date on public.doctor_appointments(user_id, appointment_date);
create index idx_push_user on public.push_subscriptions(user_id);
