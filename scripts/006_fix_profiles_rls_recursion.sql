-- ============================================================
-- Arregla "infinite recursion detected in policy for relation profiles"
-- Las políticas que consultaban profiles dentro de profiles causaban el loop.
-- Usamos una función SECURITY DEFINER que lee sin pasar por RLS.
-- Ejecuta en Supabase SQL Editor una vez.
-- ============================================================

-- Función que devuelve si el usuario actual es admin (corre sin RLS)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = auth.uid() LIMIT 1), false);
$$;

-- Quitar políticas que causan recursión
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;

-- Recrear usando la función (ya no consultan profiles dentro de la política)
CREATE POLICY "profiles_select_admin" ON public.profiles
FOR SELECT USING (public.is_admin_user());

CREATE POLICY "profiles_update_admin" ON public.profiles
FOR UPDATE USING (public.is_admin_user());
