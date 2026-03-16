-- 사장님 앱 푸시 알림 토큰 저장 테이블
create table if not exists public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('android', 'ios')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, platform)
);

-- RLS 활성화
alter table public.push_tokens enable row level security;

-- 본인 토큰만 읽기/쓰기 가능
create policy "push_tokens_self" on public.push_tokens
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 서버(service_role)에서 발송 시 읽기 가능하도록 인덱스
create index if not exists push_tokens_user_id_idx on public.push_tokens(user_id);
