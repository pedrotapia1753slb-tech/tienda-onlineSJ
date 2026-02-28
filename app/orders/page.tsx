import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Package, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmado', className: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Enviado', className: 'bg-purple-100 text-purple-700' },
  delivered: { label: 'Entregado', className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
}

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, images, price, unit, profiles(shop_name)))')
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <Navbar user={user} profile={profile} />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-8">Mis pedidos</h1>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="font-serif text-xl font-bold text-foreground mb-2">Sin pedidos aun</h2>
            <p className="text-muted-foreground mb-6">Cuando hagas un pedido apareceran aqui</p>
            <Button asChild><Link href="/">Explorar el mercado</Link></Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const status = STATUS_CONFIG[order.status] ?? { label: order.status, className: 'bg-gray-100 text-gray-700' }
              return (
                <div key={order.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                  {/* Order header */}
                  <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Pedido</p>
                        <p className="text-xs font-mono text-foreground">{order.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      <p className="font-bold text-foreground">Bs {Number(order.total).toFixed(2)}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="p-5 space-y-3">
                    {order.order_items?.map((oi: any) => (
                      <div key={oi.id} className="flex items-center gap-3">
                        <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-secondary">
                          {oi.products?.images?.[0] ? (
                            <Image src={oi.products.images[0]} alt={oi.products?.name ?? ''} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/product/${oi.product_id}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors line-clamp-1">
                            {oi.products?.name}
                          </Link>
                          {oi.products?.profiles?.shop_name && (
                            <p className="text-xs text-muted-foreground">{oi.products.profiles.shop_name}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-foreground">Bs {Number(oi.total).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">x{oi.quantity} {oi.products?.unit}</p>
                        </div>
                      </div>
                    ))}
                    {order.delivery_address && (
                      <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                        Entrega: {order.delivery_address}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
