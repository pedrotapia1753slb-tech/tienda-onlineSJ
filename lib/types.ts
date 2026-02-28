export type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  address: string | null
  address_code?: string | null
  is_seller: boolean
  is_admin: boolean
  shop_name: string | null
  shop_description: string | null
  shop_logo_url: string | null
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
  icon: string | null
  image_url: string | null
  description: string | null
  parent_id: string | null
  created_at: string
}

export type Product = {
  id: string
  seller_id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  original_price: number | null
  stock: number
  images: string[]
  unit: string
  is_active: boolean
  is_featured: boolean
  rating: number
  review_count: number
  tags: string[]
  created_at: string
  updated_at: string
  // Joined
  profiles?: Profile
  categories?: Category
}

export type Order = {
  id: string
  buyer_id: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  delivery_address: string | null
  address_code?: string | null
  notes: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  seller_id: string
  quantity: number
  unit_price: number
  total: number
  created_at: string
  products?: Product
}

export type Review = {
  id: string
  product_id: string
  buyer_id: string
  rating: number
  comment: string | null
  created_at: string
  profiles?: Profile
}

export type CartItem = {
  product: Product
  quantity: number
}
