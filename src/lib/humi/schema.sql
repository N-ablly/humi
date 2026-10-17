-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query).

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  career_stage text,
  resume_path text,
  resume_file_name text,
  recommended_role text,
  career_interest text,
  ai_readiness integer,
  report_json jsonb,
  counselling_json jsonb,
  parsed_json jsonb,
  created_at timestamptz not null default now()
);

-- Added after the table already existed in production — safe to re-run.
alter table public.candidates add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.candidates add column if not exists report_json jsonb;
alter table public.candidates add column if not exists counselling_json jsonb;
alter table public.candidates add column if not exists parsed_json jsonb;
-- How the visitor shared their background (resume / linkedin / typed / voice),
-- their LinkedIn link if given, and where the lead came from (e.g. "event" for
-- the QR code at the booth).
alter table public.candidates add column if not exists intake_method text;
alter table public.candidates add column if not exists linkedin_url text;
alter table public.candidates add column if not exists source text;
create index if not exists candidates_user_id_idx on public.candidates(user_id);

-- RLS is enabled with no policies: the table is only ever reached through
-- the server-side service_role key (see src/lib/humi/supabase.server.ts),
-- which bypasses RLS. This blocks all direct client/anon access.
alter table public.candidates enable row level security;

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

create table if not exists public.job_postings (
  id text primary key,
  title text not null,
  company text not null,
  company_blurb text not null,
  location text not null,
  work_type text not null,
  salary text not null,
  description text not null,
  responsibilities text[] not null default '{}',
  requirements text[] not null default '{}',
  ai_tools text not null,
  skills text[] not null default '{}',
  families text[] not null default '{}',
  interview_dates text[] not null default '{}',
  interview_slots text[] not null default '{}',
  interview_mode text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.job_postings enable row level security;

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  job_id text not null references public.job_postings(id) on delete cascade,
  job_title text not null,
  company text not null,
  candidate_name text not null,
  email text not null,
  phone text,
  note text,
  interview_date text not null,
  interview_time text not null,
  interview_mode text not null,
  status text not null default 'Applied',
  created_at timestamptz not null default now()
);

alter table public.job_applications add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.job_applications add column if not exists status text not null default 'Applied';
create index if not exists job_applications_user_id_idx on public.job_applications(user_id);

alter table public.job_applications enable row level security;

-- "Click for help" requests — a candidate reading their report can ask for
-- hands-on help (resume rewrite, AI tool training, etc.) from any section;
-- topic records which section they clicked it from.
create table if not exists public.help_requests (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  topic text not null,
  message text,
  created_at timestamptz not null default now()
);

alter table public.help_requests enable row level security;

-- Admin access allowlist: logging in with valid Supabase Auth credentials is
-- not enough to reach /admin (a candidate account is also a valid Auth user)
-- — the account must also have a row here. "owner" can manage this table via
-- the Team tab; "admin" cannot.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
