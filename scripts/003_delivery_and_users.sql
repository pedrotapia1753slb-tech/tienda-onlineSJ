-- ============================================================
-- Delivery system + Admin user management
-- ============================================================

-- 1. Profiles: add delivery role
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_delivery boolean DEFAULT false;

-- 2. Orders: assign delivery person
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_id uuid REFERENCES public.profiles(id);

-- 3. Admin: can read all profiles (for user list and delivery dropdown)
CREATE POLICY "profiles_select_admin" ON public.profiles
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);

-- 4. Admin: can update is_delivery (and optionally is_seller) on any profile
CREATE POLICY "profiles_update_admin" ON public.profiles
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin = true)
);

-- 5. Delivery: can read orders assigned to them
CREATE POLICY "orders_select_delivery" ON public.orders
FOR SELECT USING (
  delivery_id = auth.uid()
);

-- 6. Delivery: can update status of orders assigned to them (shipped / delivered)
CREATE POLICY "orders_update_delivery" ON public.orders
FOR UPDATE USING (
  delivery_id = auth.uid()
);
