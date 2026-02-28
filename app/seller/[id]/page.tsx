import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/product-card'
import { Store, Package, Star, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Product, Profile } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function SellerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
            },
        }
    )

    // Fetch seller profile
    const { data: seller } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

    if (!seller) notFound()

    // Fetch all active products from this seller
    const { data: products } = await supabase
        .from('products')
        .select('*, categories(name, slug)')
        .eq('seller_id', id)
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })

    const sellerProducts = (products as Product[]) || []
    const sellerName = seller.shop_name || seller.full_name || 'Vendedor'

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Back link */}
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
                <ArrowLeft className="w-4 h-4" /> Volver al inicio
            </Link>

            {/* Seller header */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Store className="w-8 h-8 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground truncate">
                            {sellerName}
                        </h1>
                        {seller.shop_description && (
                            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                                {seller.shop_description}
                            </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                {sellerProducts.length} {sellerProducts.length === 1 ? 'producto' : 'productos'}
                            </span>
                            <span>
                                Desde {new Date(seller.created_at).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products grid */}
            {sellerProducts.length === 0 ? (
                <div className="text-center py-16 bg-secondary/50 rounded-3xl">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-foreground font-medium">Este vendedor aún no tiene productos disponibles.</p>
                </div>
            ) : (
                <>
                    <h2 className="font-serif text-xl font-bold text-foreground mb-4">
                        Productos de {sellerName}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {sellerProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
