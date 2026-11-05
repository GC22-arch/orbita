-- Orbita: esquema inicial
-- Cada fila pertenece a un negocio (business_id). RLS: solo los miembros del negocio la ven y la editan.

-- ─── Perfiles (uno por usuario de auth) ───────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Negocios y miembros ─────────────────────────────────────────────
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  owner_name text not null default '',
  business_type text not null default 'otro'
    check (business_type in ('clinica', 'estetica', 'taller', 'club', 'gimnasio', 'otro')),
  currency text not null default 'USD',
  wa_templates jsonb,
  created_at timestamptz not null default now()
);

create table public.business_members (
  business_id uuid not null references public.businesses on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text not null default 'staff' check (role in ('owner', 'staff')),
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);
create index business_members_user_idx on public.business_members (user_id);

-- security definer: evita recursión de RLS al consultar la membresía
create or replace function public.is_member(target uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.business_members m
    where m.business_id = target and m.user_id = (select auth.uid())
  );
$$;

-- El creador del negocio queda como dueño automáticamente
create or replace function public.handle_new_business()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.business_members (business_id, user_id, role) values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;
create trigger on_business_created after insert on public.businesses
  for each row execute procedure public.handle_new_business();

alter table public.businesses enable row level security;
create policy "businesses_select" on public.businesses for select using (public.is_member(id));
create policy "businesses_insert" on public.businesses for insert with check (owner_id = (select auth.uid()));
create policy "businesses_update" on public.businesses for update using (public.is_member(id)) with check (public.is_member(id));
create policy "businesses_delete" on public.businesses for delete using (owner_id = (select auth.uid()));

alter table public.business_members enable row level security;
create policy "members_select" on public.business_members for select using (public.is_member(business_id));

-- ─── Datos del CRM ───────────────────────────────────────────────────
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses on delete cascade,
  name text not null,
  phone text not null,
  email text,
  birthday timestamptz,
  notes text,
  custom_fields jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses on delete cascade,
  name text not null,
  price numeric(14, 2) not null default 0,
  duration_min int not null default 60 check (duration_min >= 5),
  color text not null default 'violeta'
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses on delete cascade,
  name text not null,
  price numeric(14, 2) not null default 0,
  kind text not null check (kind in ('mensual', 'sesiones')),
  sessions int
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses on delete cascade,
  client_id uuid not null references public.clients on delete cascade,
  service_id uuid references public.services on delete set null,
  start timestamptz not null,
  duration_min int not null default 60,
  status text not null default 'confirmado'
    check (status in ('pendiente', 'confirmado', 'asistio', 'ausente', 'cancelado')),
  notes text
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses on delete cascade,
  kind text not null check (kind in ('ingreso', 'gasto')),
  client_id uuid references public.clients on delete set null,
  concept text not null,
  amount numeric(14, 2) not null check (amount >= 0),
  method text not null default 'efectivo' check (method in ('efectivo', 'transferencia', 'tarjeta', 'otro')),
  date timestamptz not null default now(),
  paid boolean not null default true
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses on delete cascade,
  client_id uuid not null references public.clients on delete cascade,
  plan_id uuid not null references public.plans on delete cascade,
  start_date timestamptz not null,
  end_date timestamptz,
  sessions_left int
);

create table public.work_orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses on delete cascade,
  client_id uuid not null references public.clients on delete cascade,
  title text not null,
  reference text,
  detail text,
  price numeric(14, 2) not null default 0,
  status text not null default 'recibido' check (status in ('recibido', 'en_proceso', 'listo', 'entregado')),
  created_at timestamptz not null default now()
);

-- Índices por negocio y por relaciones más consultadas
create index clients_business_idx on public.clients (business_id);
create index services_business_idx on public.services (business_id);
create index plans_business_idx on public.plans (business_id);
create index appointments_business_start_idx on public.appointments (business_id, start);
create index appointments_client_idx on public.appointments (client_id);
create index appointments_service_idx on public.appointments (service_id);
create index payments_business_date_idx on public.payments (business_id, date);
create index payments_client_idx on public.payments (client_id);
create index memberships_business_idx on public.memberships (business_id);
create index memberships_client_idx on public.memberships (client_id);
create index memberships_plan_idx on public.memberships (plan_id);
create index work_orders_business_idx on public.work_orders (business_id);
create index work_orders_client_idx on public.work_orders (client_id);

-- RLS uniforme para todas las tablas del CRM
do $$
declare t text;
begin
  foreach t in array array['clients', 'services', 'plans', 'appointments', 'payments', 'memberships', 'work_orders'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for all using (public.is_member(business_id)) with check (public.is_member(business_id))',
      t || '_member_all', t
    );
  end loop;
end $$;
