-- 1. Añadir columna is_admin a la tabla profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Actualizar políticas de categorías para que solo los Admins puedan modificarlas
DROP POLICY IF EXISTS "categories_manage_auth" ON public.categories;

CREATE POLICY "categories_insert_admin" ON public.categories 
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND is_admin = true)
);

CREATE POLICY "categories_update_admin" ON public.categories 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND is_admin = true)
);

CREATE POLICY "categories_delete_admin" ON public.categories 
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND is_admin = true)
);

-- Instrucción para el usuario:
-- UPDATE public.profiles SET is_admin = true WHERE id = (SELECT id FROM auth.users WHERE email = 'tu_correo_admin@ejemplo.com');
