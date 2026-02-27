import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { ProductFilters } from '@/components/product-filters'
import type { Product } from '@/lib/types'

type Props = { params: Promise<{ slug: string }> }

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null }

  const { data: categories } = await supabase.from('categories').select('*').order('name')
  const category = categories?.find(c => c.slug === slug)

  const { data: products } = await supabase
    .from('products')
    .select('*, profiles(shop_name), categories(name, slug)')
    .eq('is_active', true)
    .eq('category_id', category?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(48)

  return (
    <>
      <Navbar user={user} profile={profile} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              {category?.name ?? 'Categoria'}
            </h1>
            {category?.description && (
              <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">{products?.length ?? 0} productos</p>
          </div>
          <ProductFilters categories={categories ?? []} currentParams={{ category: slug }} />
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {(products as Product[]).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No hay productos en esta categoria todavia.</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
