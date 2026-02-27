'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Loader2, User, Store, ShoppingBag, Package, LogOut } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Profile } from '@/lib/types'

type ProfileClientProps = {
  user: { id: string; email?: string }
  profile: Profile | null
}

export function ProfileClient({ user, profile: initialProfile }: ProfileClientProps) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: initialProfile?.full_name ?? '',
    phone: initialProfile?.phone ?? '',
    address: initialProfile?.address ?? '',
    is_seller: initialProfile?.is_seller ?? false,
    shop_name: initialProfile?.shop_name ?? '',
    shop_description: initialProfile?.shop_description ?? '',
  })

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: form.full_name || null,
        phone: form.phone || null,
        address: form.address || null,
        is_seller: form.is_seller,
        shop_name: form.is_seller ? (form.shop_name || null) : null,
        shop_description: form.is_seller ? (form.shop_description || null) : null,
      })
      .select()
      .single()

    if (error) {
      toast.error('Error al guardar el perfil')
    } else {
      setProfile(data as Profile)
      toast.success('Perfil actualizado')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
          <User className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            {profile?.full_name ?? 'Mi perfil'}
          </h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <Link href="/orders" className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl hover:border-primary/40 transition-colors">
          <Package className="w-5 h-5 text-primary" />
          <div>
            <p className="font-medium text-sm text-foreground">Mis pedidos</p>
            <p className="text-xs text-muted-foreground">Ver historial</p>
          </div>
        </Link>
        {profile?.is_seller && (
          <Link href="/dashboard" className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl hover:border-primary/40 transition-colors">
            <Store className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-sm text-foreground">Mi tienda</p>
              <p className="text-xs text-muted-foreground">{profile.shop_name ?? 'Gestionar'}</p>
            </div>
          </Link>
        )}
        <Link href="/cart" className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl hover:border-primary/40 transition-colors">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <div>
            <p className="font-medium text-sm text-foreground">Mi carrito</p>
            <p className="text-xs text-muted-foreground">Ver productos</p>
          </div>
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Datos personales
          </h2>
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre completo</Label>
            <Input
              id="full_name"
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="Tu nombre"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefono</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="(555) 123-4567"
              type="tel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Direccion principal</Label>
            <Textarea
              id="address"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              placeholder="Tu direccion de entrega habitual"
              rows={2}
            />
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-foreground">Cuenta vendedor</h2>
            </div>
            <Switch
              checked={form.is_seller}
              onCheckedChange={v => setForm(f => ({ ...f, is_seller: v }))}
            />
          </div>
          {form.is_seller && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="shop_name">Nombre de tu tienda</Label>
                <Input
                  id="shop_name"
                  value={form.shop_name}
                  onChange={e => setForm(f => ({ ...f, shop_name: e.target.value }))}
                  placeholder="Ej. Verduras La Esperanza"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shop_description">Descripcion de tu tienda</Label>
                <Textarea
                  id="shop_description"
                  value={form.shop_description}
                  onChange={e => setForm(f => ({ ...f, shop_description: e.target.value }))}
                  placeholder="Cuéntale a tus clientes sobre tu negocio..."
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Guardar cambios
        </Button>
      </form>

      <div className="mt-6">
        <form action="/auth/signout" method="post">
          <Button type="submit" variant="outline" className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/5">
            <LogOut className="w-4 h-4" />
            Cerrar sesion
          </Button>
        </form>
      </div>
    </div>
  )
}
