'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useCart } from '@/lib/cart-context'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { CheckoutAddressForm } from '@/components/checkout-address-form'
import { PaymentQR } from '@/components/payment-qr'
import { Loader2, ShoppingBag, MapPin, Phone, FileText, QrCode, Banknote, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qr'>('cash')
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    address_code: '',
    notes: '',
  })
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
  const [orderTotal, setOrderTotal] = useState<number>(0)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user)
        supabase.from('profiles').select('*').eq('id', user.id).single()
          .then(({ data }) => {
            if (data) {
              setProfile(data)
              setForm(f => ({
                ...f,
                full_name: data.full_name || '',
                phone: data.phone || '',
                address: data.address || '',
                address_code: data.address_code || '',
              }))
            }
            setAuthLoading(false)
          })
      } else {
        setAuthLoading(false)
      }
    })
  }, [])

  // If QR payment and order created → show PaymentQR
  if (success && createdOrderId && paymentMethod === 'qr') {
    return (
      <>
        <Navbar user={user} profile={profile} authLoading={authLoading} />
        <main className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center">
          <PaymentQR
            orderId={createdOrderId}
            totalPrice={orderTotal}
          />
        </main>
        <Footer />
      </>
    )
  }

  // If cash payment and order created → show success
  if (success && createdOrderId && paymentMethod === 'cash') {
    return (
      <>
        <Navbar user={user} profile={profile} authLoading={authLoading} />
        <main className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center">
          <div className="text-center py-8 animate-in fade-in zoom-in duration-300 max-w-sm">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">¡Pedido confirmado!</h2>
            <p className="text-muted-foreground mb-2">
              Tu pedido ha sido registrado exitosamente.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Pagarás <strong>Bs {orderTotal}</strong> en efectivo al momento de la entrega.
            </p>
            <Button onClick={() => router.push('/orders')}>
              Ver mis pedidos
            </Button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (items.length === 0 && !success) {
    return (
      <>
        <Navbar user={user} profile={profile} authLoading={authLoading} />
        <main className="max-w-7xl mx-auto px-4 py-20 text-center">
          <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Tu carrito esta vacio</h1>
          <Button asChild className="mt-4">
            <Link href="/">Ir al mercado</Link>
          </Button>
        </main>
        <Footer />
      </>
    )
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    if (!form.address.trim()) {
      toast.error('Por favor ingresa tu direccion de entrega')
      return
    }
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Debes iniciar sesion para completar tu pedido')
      router.push('/auth/login')
      setLoading(false)
      return
    }

    // Update user profile with latest details
    await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        phone: form.phone,
        address: form.address,
        address_code: form.address_code || null,
      })
      .eq('id', user.id)

    // Create order (including 10 Bs shipping fee)
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: user.id,
        total: total + 10,
        delivery_address: `${form.full_name} | ${form.phone} | ${form.address}`,
        address_code: form.address_code || null,
        notes: form.notes || null,
        status: 'pending',
        payment_method: paymentMethod,
        payment_status: 'pending',
      })
      .select()
      .single()

    if (orderError || !order) {
      toast.error('Error al crear el pedido')
      setLoading(false)
      return
    }

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      seller_id: item.product.seller_id,
      quantity: item.quantity,
      unit_price: item.product.price,
      total: item.product.price * item.quantity,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) {
      toast.error('Error al guardar los productos del pedido')
      setLoading(false)
      return
    }

    clearCart()
    setOrderTotal(total + 10)
    setCreatedOrderId(order.id)
    setSuccess(true)
    setLoading(false)
  }

  return (
    <>
      <Navbar user={user} profile={profile} authLoading={authLoading} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-8">Finalizar pedido</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Delivery form */}
          <form onSubmit={handleCheckout} className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6">
              <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Datos de entrega
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre completo</Label>
                  <Input
                    id="full_name"
                    value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="w-3.5 h-3.5 inline mr-1" />
                    Telefono móvil (Bolivia)
                  </Label>
                  <Input
                    id="phone"
                    value={form.phone.startsWith('+591') ? form.phone : `+591 ${form.phone}`}
                    onChange={e => {
                      let val = e.target.value
                      if (!val.startsWith('+591 ')) val = '+591 '
                      const digits = val.slice(5).replace(/\D/g, '').slice(0, 8)
                      setForm(f => ({ ...f, phone: `+591 ${digits}` }))
                    }}
                    placeholder="+591 71234567"
                    type="tel"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <CheckoutAddressForm
                    address={form.address}
                    addressCode={form.address_code}
                    onAddressChange={(address) => setForm(f => ({ ...f, address }))}
                    onAddressCodeChange={(address_code) => setForm(f => ({ ...f, address_code }))}
                  />
                </div>
                <div className="sm:col-span-2 space-y-2 pt-4">
                  <Label htmlFor="notes">
                    <FileText className="w-3.5 h-3.5 inline mr-1" />
                    Notas para el vendedor (opcional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Instrucciones especiales, horario de entrega preferido..."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-card border border-border rounded-3xl p-6">
              <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2">
                <Banknote className="w-5 h-5 text-primary" />
                Método de pago
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Cash option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${paymentMethod === 'cash'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border hover:border-primary/40 bg-card'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${paymentMethod === 'cash' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                    }`}>
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Efectivo</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Paga al momento de la entrega</p>
                  </div>
                  {paymentMethod === 'cash' && (
                    <div className="ml-auto">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </button>

                {/* QR option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qr')}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${paymentMethod === 'qr'
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                      : 'border-border hover:border-primary/40 bg-card'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${paymentMethod === 'qr' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                    }`}>
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Transferencia / QR</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Paga via QR y sube tu comprobante</p>
                  </div>
                  {paymentMethod === 'qr' && (
                    <div className="ml-auto">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </button>
              </div>

              {paymentMethod === 'qr' && (
                <p className="text-xs text-muted-foreground mt-3 bg-secondary/50 rounded-xl p-3">
                  <QrCode className="w-3.5 h-3.5 inline mr-1.5 text-primary" />
                  Después de confirmar el pedido se te mostrará el código QR y los datos de la cuenta para que realices la transferencia y subas tu comprobante.
                </p>
              )}

              {paymentMethod === 'cash' && (
                <p className="text-xs text-muted-foreground mt-3 bg-secondary/50 rounded-xl p-3">
                  <Banknote className="w-3.5 h-3.5 inline mr-1.5 text-primary" />
                  El repartidor cobrará el monto total al momento de entregar tu pedido.
                </p>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Confirmar pedido — Bs {(total + 10).toFixed(0)}
            </Button>
          </form>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-3xl p-6 sticky top-24">
              <h2 className="font-semibold text-foreground mb-4">Tu pedido</h2>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-secondary">
                      {item.product.images?.[0] ? (
                        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground shrink-0">
                      Bs {(item.product.price * item.quantity).toFixed(0)}
                    </p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Subtotal</span>
                <span>Bs {total.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mb-3">
                <span>Envío y seguridad</span>
                <span>Bs 10</span>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between font-bold text-foreground text-lg">
                <span>Total</span>
                <span>Bs {(total + 10).toFixed(0)}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                {paymentMethod === 'cash' ? (
                  <>
                    <Banknote className="w-3.5 h-3.5 text-primary" />
                    <span>Pago en efectivo contra entrega</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-3.5 h-3.5 text-primary" />
                    <span>Pago por transferencia / QR</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
