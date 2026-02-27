'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Eye, EyeOff, Loader2, Store, User } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    isSeller: false,
    shopName: '',
    shopDescription: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function update(k: string, v: string | boolean) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.fullName },
        emailRedirectTo: `${window.location.origin}/`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Update profile with seller info if available
    if (data.user && form.isSeller && form.shopName) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: form.fullName,
        is_seller: true,
        shop_name: form.shopName,
        shop_description: form.shopDescription || null,
      })
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Revisa tu correo</h1>
          <p className="text-muted-foreground mb-6">
            Enviamos un enlace de confirmacion a <strong>{form.email}</strong>. Da click para activar tu cuenta.
          </p>
          <Button asChild>
            <Link href="/auth/login">Ir a iniciar sesion</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-2xl">
              M
            </div>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-foreground mt-4">Crea tu cuenta</h1>
          <p className="text-muted-foreground text-sm mt-1">Compra o vende en tu comunidad</p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={e => update('fullName', e.target.value)}
                placeholder="Maria Garcia"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electronico</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="tu@correo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contrasena</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder="Minimo 6 caracteres"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPass ? 'Ocultar' : 'Mostrar'}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Seller toggle */}
            <div className="flex items-start gap-4 p-4 bg-secondary rounded-2xl">
              <Store className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-foreground">Quiero vender aqui</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Crea tu tienda y publica productos</p>
                  </div>
                  <Switch
                    checked={form.isSeller}
                    onCheckedChange={v => update('isSeller', v)}
                  />
                </div>
                {form.isSeller && (
                  <div className="mt-4 space-y-3">
                    <Input
                      value={form.shopName}
                      onChange={e => update('shopName', e.target.value)}
                      placeholder="Nombre de tu tienda"
                      required={form.isSeller}
                    />
                    <Input
                      value={form.shopDescription}
                      onChange={e => update('shopDescription', e.target.value)}
                      placeholder="Breve descripcion (opcional)"
                    />
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Crear cuenta
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Iniciar sesion
          </Link>
        </p>
      </div>
    </div>
  )
}
