'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, ShoppingCart, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/lib/cart-context'
import type { Product } from '@/lib/types'
import { toast } from 'sonner'
import { CldImage } from 'next-cloudinary'

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0
  const image = product.images?.[0]

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    if (product.stock === 0) return
    addItem(product)
    toast.success(`${product.name} agregado al carrito`)
  }

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="bg-card border border-border rounded-sm overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all duration-200 group-hover:-translate-y-0.5">
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {image ? (
            image.includes('res.cloudinary.com') ? (
              <CldImage
                src={image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <Image
                src={image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
              <ShoppingCart className="w-10 h-10" />
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_featured && (
              <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5">
                Destacado
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="bg-accent text-accent-foreground text-xs px-2 py-0.5 font-semibold">
                -{discount}%
              </Badge>
            )}
          </div>
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-sm font-semibold bg-black/60 px-3 py-1 rounded-full">
                Agotado
              </span>
            </div>
          )}
          {/* Quick add to cart */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              className="h-8 w-8 rounded-sm shadow-md"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              aria-label="Agregar al carrito"
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          {product.profiles?.shop_name && (
            <p className="text-xs text-muted-foreground mb-1 truncate">
              {product.profiles.shop_name}
            </p>
          )}
          <h3 className="font-medium text-sm text-foreground leading-tight line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Rating */}
          {product.review_count > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-3 h-3 fill-primary text-primary" />
              <span className="text-xs text-foreground font-medium">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({product.review_count})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-end gap-2">
            <span className="font-bold text-foreground text-lg leading-none">
              ${product.price.toFixed(2)}
            </span>
            {product.original_price && (
              <span className="text-xs text-muted-foreground line-through">
                ${product.original_price.toFixed(2)}
              </span>
            )}
            <span className="text-xs text-muted-foreground ml-auto">/{product.unit}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
