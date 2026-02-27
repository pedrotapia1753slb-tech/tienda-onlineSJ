CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  is_seller BOOLEAN DEFAULT FALSE,
  shop_name TEXT,
  shop_description TEXT,
  shop_logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  image_url TEXT,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY "categories_manage_auth" ON public.categories FOR ALL USING (auth.uid() IS NOT NULL);

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12, 2) NOT NULL,
  original_price NUMERIC(12, 2),
  stock INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  unit TEXT DEFAULT 'unidad',
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  rating NUMERIC(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_select_active" ON public.products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "products_insert_own" ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "products_update_own" ON public.products FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "products_delete_own" ON public.products FOR DELETE USING (auth.uid() = seller_id);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  total NUMERIC(12, 2) NOT NULL,
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "orders_update_own" ON public.orders FOR UPDATE USING (auth.uid() = buyer_id);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  seller_id UUID NOT NULL REFERENCES public.profiles(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  total NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_select_buyer" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_id AND orders.buyer_id = auth.uid())
);
CREATE POLICY "order_items_select_seller" ON public.order_items FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "order_items_insert_own" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_id AND orders.buyer_id = auth.uid())
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (product_id, buyer_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_select_all" ON public.reviews FOR SELECT USING (TRUE);
CREATE POLICY "reviews_insert_own" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "reviews_update_own" ON public.reviews FOR UPDATE USING (auth.uid() = buyer_id);
CREATE POLICY "reviews_delete_own" ON public.reviews FOR DELETE USING (auth.uid() = buyer_id);

INSERT INTO public.categories (name, slug, icon, description) VALUES
  ('Frutas y Verduras', 'frutas-verduras', 'Carrot', 'Productos frescos del campo'),
  ('Carnes y Embutidos', 'carnes-embutidos', 'Beef', 'Carnes frescas y procesadas'),
  ('Lacteos y Huevos', 'lacteos-huevos', 'Milk', 'Productos lacteos frescos'),
  ('Panaderia', 'panaderia', 'Wheat', 'Pan y productos horneados'),
  ('Abarrotes', 'abarrotes', 'ShoppingBasket', 'Productos de despensa'),
  ('Artesanias', 'artesanias', 'Palette', 'Productos artesanales locales'),
  ('Bebidas', 'bebidas', 'GlassWater', 'Bebidas naturales y embotelladas'),
  ('Comida Preparada', 'comida-preparada', 'Utensils', 'Platillos y comidas listas')
ON CONFLICT (slug) DO NOTHING;
