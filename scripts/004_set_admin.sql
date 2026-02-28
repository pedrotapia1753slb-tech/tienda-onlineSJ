-- ============================================================
-- Asignar cuenta admin: cubasamuel852@gmail.com
-- Ejecuta este script en el SQL Editor de Supabase (una vez).
-- ============================================================

-- 1. Crear la columna is_admin si no existe (por si la tabla se creó sin ella)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 2. Marcar tu cuenta como admin
UPDATE public.profiles
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'cubasamuel852@gmail.com'
);

-- Verificar (opcional): debería devolver 1 fila con is_admin = true
-- SELECT p.id, p.full_name, p.is_admin FROM public.profiles p
-- JOIN auth.users u ON u.id = p.id WHERE u.email = 'cubasamuel852@gmail.com';
