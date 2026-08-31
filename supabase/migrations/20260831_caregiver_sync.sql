-- Migration: Caregiver & Family Sync Schema & RLS Policies

-- 1. Enum for link status
create type caregiver_link_status as enum ('pending', 'active', 'rejected');

-- 2. Caregiver Links Table
create table public.caregiver_links (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.profiles(id) on delete cascade not null,
  caregiver_id uuid references public.profiles(id) on delete cascade,
  invite_code text unique not null,
  patient_label text default 'الوالد/الوالدة',
  status caregiver_link_status default 'pending',
  alert_delay_minutes int default 20,
  notify_push boolean default true,
  notify_telegram boolean default true,
  expires_at timestamp with time zone default (now() + interval '48 hours'),
  created_at timestamp with time zone default now()
);

-- 3. Add caregiver_notified_at column to medication_logs
alter table public.medication_logs 
add column if not exists caregiver_notified_at timestamp with time zone default null;

-- 4. Indexes for rapid lookups
create index idx_caregiver_links_patient on public.caregiver_links(patient_id);
create index idx_caregiver_links_caregiver on public.caregiver_links(caregiver_id);
create index idx_caregiver_links_code on public.caregiver_links(invite_code);
create index idx_med_logs_caregiver_notify on public.medication_logs(status, scheduled_for, caregiver_notified_at);

-- 5. Enable RLS
alter table public.caregiver_links enable row level security;

-- Policies for caregiver_links:
-- Patients can manage (SELECT, INSERT, DELETE) their own generated invite links
create policy "Patients manage own caregiver links" on public.caregiver_links
  for all using (auth.uid() = patient_id);

-- Caregivers can view links where they are assigned as caregiver_id
create policy "Caregivers view assigned links" on public.caregiver_links
  for select using (auth.uid() = caregiver_id);

-- Anyone authenticated can lookup a pending invite code to link
create policy "Authenticated users lookup invite code" on public.caregiver_links
  for select using (status = 'pending');

-- Caregivers can update a link to set caregiver_id = auth.uid() and status = 'active'
create policy "Caregivers accept invite link" on public.caregiver_links
  for update using (status = 'pending')
  with check (caregiver_id = auth.uid() and status = 'active');

-- RLS Policy: Caregivers can view medications of linked patients
create policy "Caregivers view linked patient medications" on public.medications
  for select using (
    exists (
      select 1 from public.caregiver_links
      where caregiver_links.patient_id = medications.user_id
      and caregiver_links.caregiver_id = auth.uid()
      and caregiver_links.status = 'active'
    )
  );

-- RLS Policy: Caregivers can view medication logs of linked patients
create policy "Caregivers view linked patient logs" on public.medication_logs
  for select using (
    exists (
      select 1 from public.caregiver_links
      where caregiver_links.patient_id = medication_logs.user_id
      and caregiver_links.caregiver_id = auth.uid()
      and caregiver_links.status = 'active'
    )
  );

-- RLS Policy: Caregivers and patients can view each other's profile details
create policy "Caregivers and patients view linked profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.caregiver_links
      where (caregiver_links.patient_id = profiles.id and caregiver_links.caregiver_id = auth.uid() and caregiver_links.status = 'active')
         or (caregiver_links.caregiver_id = profiles.id and caregiver_links.patient_id = auth.uid() and caregiver_links.status = 'active')
    )
  );

-- Helper RPC Function: Generate Caregiver Invite Code atomically
create or replace function public.generate_caregiver_invite(
  p_patient_label text default 'الوالد/الوالدة'
)
returns text
language plpgsql
security definer
as $$
declare
  v_code text;
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'User must be authenticated';
  end if;

  -- Generate 6-char upper random code like "SEH-8941"
  v_code := 'SEH-' || lpad(floor(random() * 9000 + 1000)::text, 4, '0');

  -- Insert into caregiver_links
  insert into public.caregiver_links (patient_id, invite_code, patient_label)
  values (v_user_id, v_code, p_patient_label);

  return v_code;
end;
$$;

-- Helper RPC Function: Accept Caregiver Invite Code atomically
create or replace function public.accept_caregiver_invite(
  p_invite_code text
)
returns json
language plpgsql
security definer
as $$
declare
  v_caregiver_id uuid;
  v_link public.caregiver_links%rowtype;
  v_patient_name text;
begin
  v_caregiver_id := auth.uid();
  if v_caregiver_id is null then
    raise exception 'User must be authenticated';
  end if;

  -- Find link
  select * into v_link from public.caregiver_links
  where upper(invite_code) = upper(trim(p_invite_code))
    and status = 'pending'
    and expires_at > now();

  if v_link.id is null then
    raise exception 'الكود غير صحيح أو انتهت صلاحيته';
  end if;

  if v_link.patient_id = v_caregiver_id then
    raise exception 'لا يمكنك ربط حسابك كـ مرافق لنفسك';
  end if;

  -- Update link to active
  update public.caregiver_links
  set caregiver_id = v_caregiver_id,
      status = 'active'
  where id = v_link.id;

  -- Get patient name
  select full_name into v_patient_name from public.profiles where id = v_link.patient_id;

  return json_build_object(
    'success', true,
    'patient_id', v_link.patient_id,
    'patient_name', coalesce(v_patient_name, 'الوالد/الوالدة'),
    'label', v_link.patient_label
  );
end;
$$;

-- Enable Realtime broadcasting on caregiver_links, medication_logs, and medications
alter publication supabase_realtime add table public.caregiver_links;
alter publication supabase_realtime add table public.medication_logs;
alter publication supabase_realtime add table public.medications;
