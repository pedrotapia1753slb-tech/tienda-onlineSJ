'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ShoppingCart, Plus, Minus, Star, Store, Package, ArrowLeft, ZoomIn, ZoomOut, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/lib/cart-context'
import type { Product, Review } from '@/lib/types'
import { toast } from 'sonner'
import Link from 'next/link'
import { CldImage } from 'next-cloudinary'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

type ProductDetailClientProps = {
  product: Product
  reviews: Review[]
  relatedProducts: Product[]
}

export function ProductDetailClient({ product, reviews }: ProductDetailClientProps) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Zoom state
  const [isZoomed, setIsZoomed] = useState(false)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id)
    })
  }, [])

  const isOwnProduct = currentUserId === product.seller_id

  function handleAdd() {
    addItem(product, quantity)
    toast.success(`${product.name} agregado al carrito`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Inicio
        </Link>
        {product.categories && (
          <>
            <span>/</span>
            <Link href={`/category/${product.categories.slug}`} className="hover:text-primary transition-colors">
              {product.categories.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground truncate max-w-48">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div className="flex flex-col-reverse lg:flex-row gap-3">
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-[500px] pb-1 lg:pb-0 lg:pr-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-colors ${i === selectedImage ? 'border-primary' : 'border-border hover:border-primary/50'
                    }`}
                >
                  {img.includes('res.cloudinary.com') ? (
                    <CldImage src={img} alt={`Imagen ${i + 1}`} fill className="object-cover" />
                  ) : (
                    <Image src={img} alt={`Imagen ${i + 1}`} fill className="object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
          {/* Main image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-black border border-border flex-1 group">
            {product.images?.[selectedImage] ? (
              <>
                {product.images[selectedImage].includes('res.cloudinary.com') ? (
                  <CldImage
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-contain"
                    priority
                  />
                ) : (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-contain"
                    priority
                  />
                )}
                {/* Zoom button on main image */}
                <button
                  onClick={() => setIsZoomed(true)}
                  className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 sm:opacity-100"
                  aria-label="Acercar imagen"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground/30" />
              </div>
            )}
          </div>
        </div>

        {/* Zoom Overlay */}
        {isZoomed && product.images?.[selectedImage] && (
          <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center overflow-hidden">
            <button
              onClick={() => { setIsZoomed(false); setScale(1); setPosition({ x: 0, y: 0 }); }}
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="absolute bottom-6 flex gap-4 z-10 bg-white/10 backdrop-blur-md p-2 rounded-2xl">
              <button
                onClick={() => setScale(s => Math.max(1, s - 0.5))}
                className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-xl transition-colors disabled:opacity-50"
                disabled={scale <= 1}
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={() => setScale(s => Math.min(4, s + 0.5))}
                className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-xl transition-colors disabled:opacity-50"
                disabled={scale >= 4}
              >
                <ZoomIn className="w-5 h-5" />
              </button>
            </div>

            {/* Draggable container */}
            <div
              className={`relative w-full h-full max-w-5xl max-h-[80vh] flex items-center justify-center transition-transform ${isDragging ? 'cursor-grabbing' : scale > 1 ? 'cursor-grab' : 'cursor-default'}`}
              onMouseDown={(e) => {
                if (scale > 1) {
                  setIsDragging(true)
                  setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
                }
              }}
              onMouseMove={(e) => {
                if (isDragging && scale > 1) {
                  setPosition({
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y
                  })
                }
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              <div
                style={{
                  transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                }}
                className="relative w-full h-full"
              >
                {product.images[selectedImage].includes('res.cloudinary.com') ? (
                  <CldImage src={product.images[selectedImage]} alt={product.name} fill className="object-contain" />
                ) : (
                  <Image src={product.images[selectedImage]} alt={product.name} fill className="object-contain" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="space-y-5">
          {(product.profiles?.shop_name || product.profiles?.full_name) && (
            <Link href={`/seller/${product.seller_id}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <Store className="w-4 h-4" />
              {product.profiles.shop_name || product.profiles.full_name}
            </Link>
          )}
          <h1 className="font-serif text-3xl font-bold text-foreground text-balance leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          {product.review_count > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star
                    key={n}
                    className={`w-4 h-4 ${n <= Math.round(product.rating) ? 'fill-primary text-primary' : 'text-border fill-border'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">({product.review_count} opiniones)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-foreground">Bs {product.price.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground">/ {product.unit}</span>
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">
                  {product.stock < 10 ? `Solo quedan ${product.stock}` : 'En stock'}
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-sm text-red-500 font-medium">Agotado</span>
              </>
            )}
          </div>

          <Separator />

          {/* Quantity + Add */}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">Cantidad:</span>
                <div className="flex items-center gap-0 border border-border rounded-xl overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-none"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold text-foreground">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-none"
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex gap-3 sm:max-w-sm">
                  <Button className="flex-1 h-10 rounded-xl font-medium" disabled={isOwnProduct} onClick={handleAdd}>
                    <ShoppingCart className="w-4 h-4 mr-2 shrink-0" /> Agregar
                  </Button>
                  <Button variant="outline" className="flex-1 h-10 rounded-xl font-medium" asChild>
                    <Link href="/cart">Ver carrito</Link>
                  </Button>
                </div>
                {isOwnProduct && (
                  <p className="text-xs text-destructive text-center font-medium padding-t-1">
                    Este es tu propio producto, no puedes agregarlo a tu carrito.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {product.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <h2 className="font-semibold text-foreground">Descripcion del producto</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
            Opiniones ({reviews.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                    {review.profiles?.full_name?.[0] ?? 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-medium text-sm text-foreground truncate">
                        {review.profiles?.full_name ?? 'Usuario'}
                      </span>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star
                            key={n}
                            className={`w-3 h-3 ${n <= review.rating ? 'fill-primary text-primary' : 'text-border fill-border'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(review.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
