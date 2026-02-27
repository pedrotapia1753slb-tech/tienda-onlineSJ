import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CategoryGrid } from '@/components/category-grid'
import { ProductCard } from '@/components/product-card'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, ShieldCheck, Truck, Leaf, Users } from 'lucide-react'
import type { Product, Category } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*, profiles(shop_name, avatar_url), categories(name, slug)')
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8)

  const { data: newProducts } = await supabase
    .from('products')
    .select('*, profiles(shop_name, avatar_url), categories(name, slug)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <>
      <Navbar user={user} profile={profile} />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-secondary border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-12 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-6">
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs px-3 py-1 rounded-sm font-medium tracking-widest uppercase">
                  <Leaf className="w-3 h-3 mr-1.5" />
                  Productos 100% locales y frescos
                </Badge>
                <h1 className="font-serif text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight tracking-tight text-balance">
                  El mercado de tu<br />
                  <span className="text-primary">comunidad</span>, en linea
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                  Compra directamente a productores y artesanos de tu pueblo. Fresco, autentico y con entrega a domicilio.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button size="lg" asChild className="gap-2 rounded-sm">
                    <Link href="/products">
                      Explorar productos <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="rounded-sm border-foreground/30 hover:bg-foreground hover:text-primary-foreground">
                    <Link href="/auth/register">Vender aqui</Link>
                  </Button>
                </div>
                {/* Trust badges */}
                <div className="flex flex-wrap gap-5 pt-2 border-t border-border">
                  {[
                    { icon: ShieldCheck, label: 'Compra segura' },
                    { icon: Truck, label: 'Entrega local' },
                    { icon: Users, label: '+200 vendedores' },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon className="w-4 h-4 text-primary" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative rounded-sm overflow-hidden shadow-2xl aspect-[4/3] lg:aspect-square border border-border">
                <Image
                  src="/images/hero-market.jpg"
                  alt="Mercado local con productos frescos"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  priority
                />
                {/* Floating card */}
                <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm rounded-sm p-4 shadow-xl border border-border max-w-48">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest">Vendedores activos</p>
                  <p className="font-serif font-bold text-2xl text-foreground">200+</p>
                  <p className="text-xs text-primary mt-1 font-semibold tracking-wide">en tu comunidad</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="max-w-7xl mx-auto px-4 py-10">
          <CategoryGrid categories={(categories as Category[]) ?? []} />
        </section>

        {/* Featured Products */}
        {featuredProducts && featuredProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">Destacados del dia</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Los mejores productos seleccionados</p>
              </div>
              <Link href="/products?featured=true" className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
                Ver todos <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {(featuredProducts as Product[]).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Banner */}
        <section className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-foreground rounded-sm p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-6 border border-border">
            <div>
              <p className="text-xs text-accent uppercase tracking-widest font-semibold mb-2">Para productores y artesanos</p>
              <h2 className="font-serif text-2xl lg:text-3xl font-bold text-primary-foreground text-balance">
                ¿Tienes un negocio o eres productor?
              </h2>
              <p className="text-primary-foreground/60 mt-2 max-w-md text-sm leading-relaxed">
                Registra tu tienda gratis y llega a cientos de clientes en tu comunidad. Simple, rapido y sin comisiones el primer mes.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Button size="lg" className="rounded-sm bg-primary-foreground text-foreground hover:bg-primary-foreground/90" asChild>
                <Link href="/auth/register">Comenzar gratis</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        {newProducts && newProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-6 pb-16">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">Nuevos productos</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Recien llegados al mercado</p>
              </div>
              <Link href="/products" className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
                Ver todos <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {(newProducts as Product[]).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state if no products */}
        {(!featuredProducts || featuredProducts.length === 0) && (!newProducts || newProducts.length === 0) && (
          <section className="max-w-7xl mx-auto px-4 py-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Leaf className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-2">El mercado se esta llenando</h2>
              <p className="text-muted-foreground mb-6">
                Se el primero en vender tus productos aqui. Registrate y empieza hoy.
              </p>
              <Button asChild>
                <Link href="/auth/register">Registrarse gratis</Link>
              </Button>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
