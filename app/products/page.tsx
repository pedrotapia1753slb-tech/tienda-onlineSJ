import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { ProductFilters } from '@/components/product-filters'
import type { Product } from '@/lib/types'

type SearchParams = Promise<{
  q?: string
  category?: string
  featured?: string
  min?: string
  max?: string
  sort?: string
}>

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null }

  const { data: categories } = await supabase.from('categories').select('*').order('name')

  let query = supabase
    .from('products')
    .select('*, profiles(shop_name), categories(name, slug)')
    .eq('is_active', true)

  if (sp.q) {
    query = query.ilike('name', `%${sp.q}%`)
  }
  if (sp.category) {
    const cat = categories?.find(c => c.slug === sp.category)
    if (cat) query = query.eq('category_id', cat.id)
  }
  if (sp.featured === 'true') {
    query = query.eq('is_featured', true)
  }
  if (sp.min) query = query.gte('price', parseFloat(sp.min))
  if (sp.max) query = query.lte('price', parseFloat(sp.max))

  if (sp.sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (sp.sort === 'price_desc') query = query.order('price', { ascending: false })
  else if (sp.sort === 'rating') query = query.order('rating', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data: products } = await query.limit(48)

  const title = sp.q
    ? `Resultados para "${sp.q}"`
    : sp.category
      ? (categories?.find(c => c.slug === sp.category)?.name ?? 'Productos')
      : 'Todos los productos'

  return (
    <>
      <Navbar user={user} profile={profile} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {products?.length ?? 0} productos encontrados
            </p>
          </div>
          <ProductFilters categories={categories ?? []} currentParams={sp} />
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(products as Product[]).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No se encontraron productos.</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
