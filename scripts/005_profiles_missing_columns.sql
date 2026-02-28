-- ============================================================
-- Columnas que la app usa pero que pueden faltar en profiles
-- (por si la tabla se creó solo con 001 y no tenía address_code)
-- Ejecuta en Supabase SQL Editor una vez.
--
-- Resumen de lo que se hizo en la base de datos en esta app:
-- • 001: tabla profiles (sin is_admin ni address_code)
-- • 002: payment_method, payment_proof_url, payment_status en orders; site_settings
-- • 003: is_delivery en profiles; delivery_id en orders; políticas RLS para admin y delivery
-- • 004: is_admin en profiles; marcar cubasamuel852@gmail.com como admin
-- • 005 (este): asegurar address_code, is_admin, is_delivery en profiles
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_delivery boolean DEFAULT false;
