'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
        supabase.from('profiles').select('*').eq('id', user.id).single()
          .then(({ data }) => setProfile(data))
      }
    })
  }, [])

  if (items.length === 0) {
    return (
      <>
        <Navbar user={user} profile={profile} />
        <main className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Tu carrito esta vacio</h1>
            <p className="text-muted-foreground mb-6">
              Explora el mercado y agrega productos frescos y locales.
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ir al mercado
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar user={user} profile={profile} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-3xl font-bold text-foreground">Mi carrito</h1>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={clearCart}>
            <Trash2 className="w-4 h-4 mr-1.5" /> Vaciar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div
                key={item.product.id}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4"
              >
                <Link href={`/product/${item.product.id}`} className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-black">
                  {item.product.images?.[0] ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.product.id}`}>
                    <h3 className="font-medium text-sm text-foreground line-clamp-2 hover:text-primary transition-colors">
                      {item.product.name}
                    </h3>
                  </Link>
                  {item.product.profiles?.shop_name && (
                    <p className="text-xs text-muted-foreground mt-0.5">{item.product.profiles.shop_name}</p>
                  )}
                  <p className="font-bold text-foreground mt-1">Bs {item.product.price.toFixed(2)}/{item.product.unit}</p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <button
                    onClick={() => { removeItem(item.product.id); toast('Producto removido del carrito') }}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-0 border border-border rounded-xl overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-none"
                      onClick={() => updateQuantity(item.product.id, Math.min(item.product.stock, item.quantity + 1))}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    Bs {(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-24">
              <h2 className="font-serif text-xl font-bold text-foreground mb-5">Resumen del pedido</h2>
              <div className="space-y-3 text-sm">
                {items.map(item => (
                  <div key={item.product.id} className="flex justify-between text-muted-foreground">
                    <span className="truncate flex-1 mr-2">{item.product.name} x{item.quantity}</span>
                    <span className="shrink-0">Bs {(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Subtotal</span>
                <span>Bs {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mb-3">
                <span>Envío y seguridad</span>
                <span>Bs 10.00</span>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between font-bold text-foreground text-lg mb-6">
                <span>Total</span>
                <span>Bs {(total + 10).toFixed(2)}</span>
              </div>
              <Button size="lg" className="w-full" asChild>
                <Link href="/checkout">Proceder al pago</Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full mt-3" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Seguir comprando
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
