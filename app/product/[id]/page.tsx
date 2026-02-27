import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductDetailClient } from '@/components/product-detail-client'
import { ProductCard } from '@/components/product-card'
import type { Product, Review } from '@/lib/types'

type Props = { params: Promise<{ id: string }> }

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('*').eq('id', user.id).single()
    : { data: null }

  const { data: product, error } = await supabase
    .from('products')
    .select('*, profiles(*), categories(*)')
    .eq('id', id)
    .single()

  if (error || !product) notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url)')
    .eq('product_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*, profiles(shop_name), categories(name, slug)')
    .eq('category_id', product.category_id)
    .eq('is_active', true)
    .neq('id', id)
    .limit(4)

  return (
    <>
      <Navbar user={user} profile={profile} />
      <main>
        <ProductDetailClient
          product={product as Product}
          reviews={(reviews as Review[]) ?? []}
          relatedProducts={(relatedProducts as Product[]) ?? []}
        />
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 pb-16">
            <h2 className="font-serif text-2xl font-bold text-foreground mb-5">
              Productos relacionados
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(relatedProducts as Product[]).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}
