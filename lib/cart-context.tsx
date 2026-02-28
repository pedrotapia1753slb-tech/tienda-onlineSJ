'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CartItem, Product } from '@/lib/types'

type CartContextType = {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  // Listen to auth state to get user ID
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null)
      setReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null)
      setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Load cart from localStorage when userId changes
  useEffect(() => {
    if (!ready) return
    if (!userId) {
      setItems([])
      return
    }
    const key = `novashopsj-cart-${userId}`
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch { }
    } else {
      // Migrate old anonymous cart if it exists
      const oldCart = localStorage.getItem('novashopsj-cart')
      if (oldCart) {
        try {
          const parsed = JSON.parse(oldCart)
          setItems(parsed)
          localStorage.setItem(key, oldCart)
        } catch { }
        localStorage.removeItem('novashopsj-cart')
      } else {
        setItems([])
      }
    }
  }, [userId, ready])

  // Save cart to localStorage when items change
  useEffect(() => {
    if (!ready || !userId) return
    localStorage.setItem(`novashopsj-cart-${userId}`, JSON.stringify(items))
  }, [items, userId, ready])

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        )
      }
      return [...prev, { product, quantity }]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.product.id !== productId))
      return
    }
    setItems(prev =>
      prev.map(i =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
