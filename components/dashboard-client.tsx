'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Package, TrendingUp, ShoppingBag, Plus, Edit2, Trash2,
  Loader2, Store, DollarSign, Eye, EyeOff, BarChart3
} from 'lucide-react'
import type { Product, Profile, Category } from '@/lib/types'
import { toast } from 'sonner'
import Image from 'next/image'

type DashboardClientProps = {
  profile: Profile
  products: Product[]
  categories: Category[]
  orderItems: any[]
  totalRevenue: number
}

export function DashboardClient({ profile, products, categories, orderItems, totalRevenue }: DashboardClientProps) {
  const [localProducts, setLocalProducts] = useState<Product[]>(products)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    stock: '',
    unit: 'unidad',
    category_id: '',
    images: '',
    tags: '',
    is_featured: false,
    is_active: true,
  })

  function openNew() {
    setEditingProduct(null)
    setForm({ name: '', description: '', price: '', original_price: '', stock: '', unit: 'unidad', category_id: '', images: '', tags: '', is_featured: false, is_active: true })
    setShowForm(true)
  }

  function openEdit(p: Product) {
    setEditingProduct(p)
    setForm({
      name: p.name,
      description: p.description ?? '',
      price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : '',
      stock: String(p.stock),
      unit: p.unit,
      category_id: p.category_id ?? '',
      images: p.images?.join(', ') ?? '',
      tags: p.tags?.join(', ') ?? '',
      is_featured: p.is_featured,
      is_active: p.is_active,
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name || !form.price) {
      toast.error('Nombre y precio son requeridos')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const payload = {
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      stock: parseInt(form.stock) || 0,
      unit: form.unit,
      category_id: form.category_id || null,
      images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
      tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      is_featured: form.is_featured,
      is_active: form.is_active,
    }

    if (editingProduct) {
      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingProduct.id)
        .select('*, categories(name, slug)')
        .single()
      if (error) { toast.error('Error al actualizar'); setLoading(false); return }
      setLocalProducts(prev => prev.map(p => p.id === editingProduct.id ? data as Product : p))
      toast.success('Producto actualizado')
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('products')
        .insert({ ...payload, seller_id: user!.id })
        .select('*, categories(name, slug)')
        .single()
      if (error) { toast.error('Error al crear producto'); setLoading(false); return }
      setLocalProducts(prev => [data as Product, ...prev])
      toast.success('Producto creado')
    }
    setShowForm(false)
    setLoading(false)
  }

  async function handleDelete(productId: string) {
    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) { toast.error('Error al eliminar'); return }
    setLocalProducts(prev => prev.filter(p => p.id !== productId))
    toast.success('Producto eliminado')
  }

  async function toggleActive(product: Product) {
    const supabase = createClient()
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
    setLocalProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p))
  }

  const activeCount = localProducts.filter(p => p.is_active).length
  const totalStock = localProducts.reduce((s, p) => s + p.stock, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Mi Tienda</h1>
          <div className="flex items-center gap-2 mt-1">
            <Store className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">{profile.shop_name ?? profile.full_name}</span>
          </div>
        </div>
        {!showForm && (
          <Button onClick={openNew} className="gap-2">
            <Plus className="w-4 h-4" /> Nuevo producto
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Productos activos', value: activeCount, icon: Package, color: 'text-primary' },
          { label: 'Total en stock', value: totalStock, icon: BarChart3, color: 'text-blue-500' },
          { label: 'Pedidos recibidos', value: orderItems.length, icon: ShoppingBag, color: 'text-green-500' },
          { label: 'Ingresos totales', value: `$${totalRevenue.toFixed(0)}`, icon: DollarSign, color: 'text-accent' },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className="font-serif text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Product Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-3xl p-6 mb-8">
          <h2 className="font-serif text-xl font-bold text-foreground mb-5">
            {editingProduct ? 'Editar producto' : 'Nuevo producto'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Label>Nombre del producto *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ej. Jitomates organicos" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>Descripcion</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe tu producto..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Precio *</Label>
              <Input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>Precio original (opcional)</Label>
              <Input type="number" step="0.01" value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>Stock disponible</Label>
              <Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Unidad de venta</Label>
              <Select value={form.unit} onValueChange={v => setForm(f => ({ ...f, unit: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['unidad', 'kg', 'g', 'litro', 'ml', 'docena', 'paquete', 'bolsa', 'manojo'].map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar categoria" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>URLs de imagenes (separadas por comas)</Label>
              <Input value={form.images} onChange={e => setForm(f => ({ ...f, images: e.target.value }))} placeholder="https://... , https://..." />
            </div>
            <div className="space-y-2">
              <Label>Etiquetas (separadas por comas)</Label>
              <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="organico, fresco, local" />
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary rounded-2xl">
              <div>
                <p className="text-sm font-medium text-foreground">Destacar producto</p>
                <p className="text-xs text-muted-foreground">Aparece en la seccion de destacados</p>
              </div>
              <Switch checked={form.is_featured} onCheckedChange={v => setForm(f => ({ ...f, is_featured: v }))} />
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary rounded-2xl">
              <div>
                <p className="text-sm font-medium text-foreground">Producto activo</p>
                <p className="text-xs text-muted-foreground">Visible en el mercado</p>
              </div>
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button onClick={handleSave} disabled={loading} className="gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingProduct ? 'Guardar cambios' : 'Crear producto'}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </div>
      )}

      {/* Products & Orders tabs */}
      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger value="products" className="gap-2">
            <Package className="w-4 h-4" /> Mis productos ({localProducts.length})
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <TrendingUp className="w-4 h-4" /> Pedidos ({orderItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          {localProducts.length === 0 ? (
            <div className="text-center py-16 bg-secondary rounded-3xl">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium mb-1">Todavia no tienes productos</p>
              <p className="text-muted-foreground text-sm mb-4">Agrega tu primer producto para comenzar a vender</p>
              <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Agregar producto</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {localProducts.map(product => (
                <div key={product.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                  <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-secondary">
                    {product.images?.[0] ? (
                      <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-medium text-sm text-foreground truncate">{product.name}</h3>
                      {product.is_featured && <Badge className="text-xs bg-primary/10 text-primary border-primary/20">Destacado</Badge>}
                      {!product.is_active && <Badge variant="secondary" className="text-xs">Inactivo</Badge>}
                    </div>
                    {(product.categories as any)?.name && (
                      <p className="text-xs text-muted-foreground mt-0.5">{(product.categories as any).name}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-bold text-foreground">${product.price.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleActive(product)} aria-label={product.is_active ? 'Desactivar' : 'Activar'}>
                      {product.is_active ? <Eye className="w-4 h-4 text-green-500" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)} aria-label="Editar">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(product.id)} aria-label="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders">
          {orderItems.length === 0 ? (
            <div className="text-center py-16 bg-secondary rounded-3xl">
              <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium">Todavia no tienes pedidos</p>
              <p className="text-muted-foreground text-sm mt-1">Cuando alguien compre tus productos apareceran aqui</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orderItems.map((oi: any) => (
                <div key={oi.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{oi.products?.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(oi.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-foreground">${oi.total?.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">x{oi.quantity}</p>
                  </div>
                  <OrderStatusBadge status={oi.orders?.status} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
    confirmed: { label: 'Confirmado', className: 'bg-blue-100 text-blue-700' },
    shipped: { label: 'Enviado', className: 'bg-purple-100 text-purple-700' },
    delivered: { label: 'Entregado', className: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
  }
  const c = config[status] ?? { label: status, className: 'bg-gray-100 text-gray-700' }
  return <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${c.className}`}>{c.label}</span>
}
