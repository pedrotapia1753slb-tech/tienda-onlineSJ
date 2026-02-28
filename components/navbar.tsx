'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import {
  ShoppingCart, Search, Menu, X, User,
  ChevronDown, Store, Package, LogOut, Shield, Loader2
} from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

type NavbarProps = {
  user?: { id: string; email?: string } | null
  profile?: Profile | null
}

type NavCategory = {
  label: string
  href: string
}

const DEFAULT_CATEGORIES: NavCategory[] = [
  { label: 'Todos', href: '/products' },
  { label: 'Frutas y Verduras', href: '/category/frutas-verduras' },
  { label: 'Carnes', href: '/category/carnes-embutidos' },
  { label: 'Lacteos', href: '/category/lacteos-huevos' },
  { label: 'Panaderia', href: '/category/panaderia' },
  { label: 'Abarrotes', href: '/category/abarrotes' },
  { label: 'Artesanias', href: '/category/artesanias' },
  { label: 'Bebidas', href: '/category/bebidas' },
  { label: 'Comida Preparada', href: '/category/comida-preparada' },
]

export function Navbar({ user, profile }: NavbarProps) {
  const { count } = useCart()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState<NavCategory[]>(DEFAULT_CATEGORIES)
  const [liveResults, setLiveResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showLive, setShowLive] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const searchRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowLive(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setLiveResults([])
      setShowLive(false)
      return
    }

    setShowLive(true)
    setIsSearching(true)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      const supabase = createClient()
      const term = searchQuery.trim()

      const { data } = await supabase
        .from('products')
        .select('id, name, price, images, categories(name)')
        .eq('is_active', true)
        .or(`name.ilike.%${term}%,tags.cs.{${term}}`)
        .limit(3)

      if (data) {
        setLiveResults(data)
      }
      setIsSearching(false)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  useEffect(() => {
    async function loadCategories() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('categories')
        .select('name, slug, products(id)')

      if (!error && data && data.length > 0) {
        const sorted = data.map(cat => ({
          label: cat.name,
          href: `/category/${cat.slug}`,
          count: cat.products?.length || 0
        })).sort((a, b) => b.count - a.count)

        setCategories([
          { label: 'Todos', href: '/products' },
          ...sorted.map(s => ({ label: s.label, href: s.href }))
        ])
      }
    }
    loadCategories()
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-9 h-9 rounded-sm bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-lg group-hover:opacity-90 transition-opacity">
            N
          </div>
          <div className="hidden sm:block">
            <span className="font-serif font-bold text-foreground text-xl leading-none block tracking-tight">
              NovaShop
            </span>
            <span className="text-xs text-muted-foreground leading-none tracking-widest uppercase">SJ</span>
          </div>
        </Link>

        {/* Search */}
        <form ref={searchRef} onSubmit={handleSearch} className="flex-1 max-w-2xl mx-2 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchQuery.trim().length >= 2) setShowLive(true) }}
              placeholder="Busca frutas, carnes, artesanias..."
              className="pl-9 pr-4 h-10 bg-muted border-border rounded-sm text-sm focus-visible:ring-primary/50"
            />
          </div>

          {/* Live Search Dropdown */}
          {showLive && searchQuery.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
              {isSearching ? (
                <div className="p-4 flex items-center justify-center text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : liveResults.length > 0 ? (
                <div className="flex flex-col">
                  {liveResults.map(product => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      onClick={() => setShowLive(false)}
                      className="flex items-center gap-3 p-3 hover:bg-secondary transition-colors border-b border-border last:border-0"
                    >
                      <div className="relative w-10 h-10 rounded-md overflow-hidden bg-secondary shrink-0">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 absolute inset-0 m-auto text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-semibold">Bs {product.price.toFixed(2)}</span>
                          {product.categories?.name && (
                            <span className="text-muted-foreground border-l border-border pl-2">{product.categories.name}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                  <button
                    type="submit"
                    className="p-2 text-xs font-medium text-center text-primary bg-secondary/50 hover:bg-secondary transition-colors"
                    onClick={(e) => { e.preventDefault(); setShowLive(false); handleSearch(e); }}
                  >
                    Ver todos los resultados
                  </button>
                </div>
              ) : (
                <div className="p-4 text-sm text-center text-muted-foreground">
                  No se encontraron resultados
                </div>
              )}
            </div>
          )}
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 hidden sm:flex hover:bg-secondary">
                  <User className="w-4 h-4" />
                  <span className="text-sm max-w-24 truncate">
                    {profile?.full_name?.split(' ')[0] || 'Mi cuenta'}
                  </span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="w-4 h-4" /> Mi perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="flex items-center gap-2">
                    <Package className="w-4 h-4" /> Mis pedidos
                  </Link>
                </DropdownMenuItem>
                {profile?.is_seller && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <Store className="w-4 h-4" /> Mi tienda
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                {profile?.is_admin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2 text-primary font-medium">
                        <Shield className="w-4 h-4" /> Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action="/auth/signout" method="post">
                    <button type="submit" className="flex items-center gap-2 w-full text-destructive">
                      <LogOut className="w-4 h-4" /> Cerrar sesion
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="hover:bg-secondary">
                <Link href="/auth/login">Ingresar</Link>
              </Button>
              <Button size="sm" asChild className="rounded-sm">
                <Link href="/auth/register">Registrarse</Link>
              </Button>
            </div>
          )}

          {/* Cart */}
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Carrito de compras" className="hover:bg-secondary">
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 min-w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground border-0 rounded-full">
                  {count > 99 ? '99+' : count}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Mobile menu */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden hover:bg-secondary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Category nav bar */}
      <nav className="border-t border-border bg-foreground overflow-x-auto scrollbar-none hidden sm:block">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-0 text-sm">
            {categories.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="px-3 py-2.5 inline-block text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10 transition-colors whitespace-nowrap text-xs tracking-wide uppercase font-medium"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-border bg-card px-4 pb-4 space-y-2">
          {!user ? (
            <div className="flex gap-2 pt-3">
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)}>Ingresar</Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link href="/auth/register" onClick={() => setMobileOpen(false)}>Registrarse</Link>
              </Button>
            </div>
          ) : (
            <div className="pt-3 space-y-1">
              <Link href="/profile" className="flex items-center gap-2 py-2 text-sm text-foreground" onClick={() => setMobileOpen(false)}>
                <User className="w-4 h-4" /> Mi perfil
              </Link>
              <Link href="/orders" className="flex items-center gap-2 py-2 text-sm text-foreground" onClick={() => setMobileOpen(false)}>
                <Package className="w-4 h-4" /> Mis pedidos
              </Link>
              {profile?.is_seller && (
                <Link href="/dashboard" className="flex items-center gap-2 py-2 text-sm text-foreground" onClick={() => setMobileOpen(false)}>
                  <Store className="w-4 h-4" /> Mi tienda
                </Link>
              )}
              {profile?.is_admin && (
                <Link href="/admin" className="flex items-center gap-2 py-2 text-sm text-primary font-medium" onClick={() => setMobileOpen(false)}>
                  <Shield className="w-4 h-4" /> Admin Panel
                </Link>
              )}
              <form action="/auth/signout" method="post" className="w-full">
                <button type="submit" className="flex items-center gap-2 py-2 text-sm text-destructive w-full" onClick={() => setMobileOpen(false)}>
                  <LogOut className="w-4 h-4" /> Cerrar sesion
                </button>
              </form>
            </div>
          )}
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Categorias</p>
            <div className="flex flex-wrap gap-2">
              {categories.slice(1).map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-xs bg-secondary px-3 py-1.5 rounded-full text-foreground/80 hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
