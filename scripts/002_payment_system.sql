-- ============================================================
-- Migración: Sistema de Pagos (QR / Efectivo) + Admin Settings
-- ============================================================

-- 1. Nuevas columnas en orders para el método de pago
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- 2. Tabla de configuración global (key-value)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer los settings (necesario para que el checkout vea el QR)
CREATE POLICY "site_settings_select_all" ON public.site_settings FOR SELECT USING (TRUE);

-- Solo admins pueden modificar settings
CREATE POLICY "site_settings_insert_admin" ON public.site_settings
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND is_admin = true)
);

CREATE POLICY "site_settings_update_admin" ON public.site_settings
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND is_admin = true)
);

CREATE POLICY "site_settings_delete_admin" ON public.site_settings
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND is_admin = true)
);

-- 3. Política para que los admins puedan leer TODOS los pedidos (no solo los propios)
CREATE POLICY "orders_select_admin" ON public.orders
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND is_admin = true)
);

-- 4. Política para que los admins puedan actualizar TODOS los pedidos (verificar/rechazar pagos)
CREATE POLICY "orders_update_admin" ON public.orders
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND is_admin = true)
);

-- 5. Política para que los admins puedan leer TODOS los order_items
CREATE POLICY "order_items_select_admin" ON public.order_items
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND is_admin = true)
);
