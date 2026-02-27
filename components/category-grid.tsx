import Link from 'next/link'
import {
  Carrot, Beef, Milk, Wheat, ShoppingBasket,
  Palette, GlassWater, Utensils
} from 'lucide-react'

const ICONS: Record<string, React.ElementType> = {
  Carrot, Beef, Milk, Wheat, ShoppingBasket, Palette, GlassWater, Utensils
}

type Category = {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const colors = [
    'bg-orange-100 text-orange-600',
    'bg-red-100 text-red-600',
    'bg-yellow-100 text-yellow-600',
    'bg-amber-100 text-amber-700',
    'bg-lime-100 text-lime-700',
    'bg-pink-100 text-pink-600',
    'bg-teal-100 text-teal-600',
    'bg-rose-100 text-rose-600',
  ]

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-serif text-2xl font-bold text-foreground">Categorias</h2>
        <Link href="/products" className="text-sm text-primary hover:underline font-medium">
          Ver todo
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.map((cat, idx) => {
          const IconEl = cat.icon && ICONS[cat.icon] ? ICONS[cat.icon] : ShoppingBasket
          const colorClass = colors[idx % colors.length]
          return (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-2xl hover:border-primary hover:shadow-sm transition-all group"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorClass} group-hover:scale-110 transition-transform`}>
                <IconEl className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-center text-foreground leading-tight">
                {cat.name}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
