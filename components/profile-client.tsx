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
    address_code: initialProfile?.address_code ?? '',
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
        address_code: form.address_code || null,
        is_seller: form.is_seller,
        shop_name: form.is_seller ? (form.full_name || null) : null,
        shop_description: null,
      })
      .select()
      .single()

    if (error) {
      const msg = error.message || error.details || (typeof error === 'object' ? JSON.stringify(error) : String(error)) || 'Revisa que la tabla profiles tenga las columnas: full_name, phone, address, address_code, is_seller, shop_name, shop_description. Ejecuta scripts/005_profiles_missing_columns.sql en Supabase si falta address_code.'
      console.error('Supabase upsert error:', error)
      toast.error(`Error al guardar el perfil: ${msg}`)
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
            <Label htmlFor="phone">Telefono móvil (Bolivia)</Label>
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
          <div className="space-y-2">
            <Label htmlFor="address_code">Código Plus (ubicación)</Label>
            <div className="flex gap-2">
              <Input
                id="address_code"
                value={form.address_code}
                onChange={e => setForm(f => ({ ...f, address_code: e.target.value.toUpperCase() }))}
                placeholder="Ej: 57R9J94J+7H"
                className="font-mono text-sm"
              />
              {form.address_code && form.address_code.includes('+') && (
                <Button type="button" variant="outline" size="sm" asChild className="shrink-0">
                  <a href={`https://plus.codes/${form.address_code}`} target="_blank" rel="noopener noreferrer">
                    Ver mapa
                  </a>
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Busca tu código en <a href="https://plus.codes/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">plus.codes</a></p>
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
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Guardar cambios
        </Button>
      </form>

      <div className="mt-6">
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
          onClick={async () => {
            try {
              await fetch('/auth/signout', { method: 'POST', redirect: 'manual' })
            } catch { }
            window.location.href = '/'
          }}
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesion
        </Button>
      </div>
    </div>
  )
}
