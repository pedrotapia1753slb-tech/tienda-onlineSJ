'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ShoppingCart, Search, Menu, X, MapPin, User,
  ChevronDown, Store, Package, LogOut
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

type NavbarProps = {
  user?: { id: string; email?: string } | null
  profile?: Profile | null
}

export function Navbar({ user, profile }: NavbarProps) {
  const { count } = useCart()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-xs py-1.5 px-4 text-center font-sans">
        <MapPin className="inline w-3 h-3 mr-1" />
        Entrega en tu comunidad — Productos frescos y locales cada dia
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-lg group-hover:opacity-90 transition-opacity">
            M
          </div>
          <div className="hidden sm:block">
            <span className="font-serif font-bold text-foreground text-xl leading-none block">
              Mercado
            </span>
            <span className="text-xs text-muted-foreground leading-none">Local</span>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Busca frutas, carnes, artesanias..."
              className="pl-9 pr-4 h-10 bg-secondary border-border rounded-full text-sm"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1.5 hidden sm:flex">
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
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Ingresar</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Registrarse</Link>
              </Button>
            </div>
          )}

          {/* Cart */}
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Carrito de compras">
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
            className="sm:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Category nav bar */}
      <nav className="border-t border-border bg-secondary overflow-x-auto scrollbar-none hidden sm:block">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-0 text-sm">
            {[
              { label: 'Todos', href: '/products' },
              { label: 'Frutas y Verduras', href: '/category/frutas-verduras' },
              { label: 'Carnes', href: '/category/carnes-embutidos' },
              { label: 'Lacteos', href: '/category/lacteos-huevos' },
              { label: 'Panaderia', href: '/category/panaderia' },
              { label: 'Abarrotes', href: '/category/abarrotes' },
              { label: 'Artesanias', href: '/category/artesanias' },
              { label: 'Bebidas', href: '/category/bebidas' },
              { label: 'Comida Preparada', href: '/category/comida-preparada' },
            ].map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="px-3 py-2 inline-block text-foreground/80 hover:text-primary hover:bg-primary/8 transition-colors whitespace-nowrap"
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
                <Link href="/auth/login">Ingresar</Link>
              </Button>
              <Button className="flex-1" asChild>
                <Link href="/auth/register">Registrarse</Link>
              </Button>
            </div>
          ) : (
            <div className="pt-3 space-y-1">
              <Link href="/profile" className="flex items-center gap-2 py-2 text-sm text-foreground">
                <User className="w-4 h-4" /> Mi perfil
              </Link>
              <Link href="/orders" className="flex items-center gap-2 py-2 text-sm text-foreground">
                <Package className="w-4 h-4" /> Mis pedidos
              </Link>
              {profile?.is_seller && (
                <Link href="/dashboard" className="flex items-center gap-2 py-2 text-sm text-foreground">
                  <Store className="w-4 h-4" /> Mi tienda
                </Link>
              )}
            </div>
          )}
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Categorias</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Frutas', href: '/category/frutas-verduras' },
                { label: 'Carnes', href: '/category/carnes-embutidos' },
                { label: 'Lacteos', href: '/category/lacteos-huevos' },
                { label: 'Panaderia', href: '/category/panaderia' },
                { label: 'Abarrotes', href: '/category/abarrotes' },
                { label: 'Artesanias', href: '/category/artesanias' },
                { label: 'Bebidas', href: '/category/bebidas' },
              ].map(item => (
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
