-- Orbita: refuerzos sugeridos por el asesor de Supabase

-- Las funciones de los triggers no deben poder llamarse desde la API
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_new_business() from public, anon, authenticated;

-- is_member la usan las reglas RLS de usuarios con sesión; nadie anónimo la necesita
revoke execute on function public.is_member(uuid) from public, anon;
grant execute on function public.is_member(uuid) to authenticated;

-- auth.uid() evaluado una sola vez por consulta (más rápido con muchas filas)
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update using ((select auth.uid()) = id);

-- Índice para la clave foránea del dueño
create index if not exists businesses_owner_idx on public.businesses (owner_id);
