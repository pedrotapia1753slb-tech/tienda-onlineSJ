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
  // Elegant green-toned icon backgrounds cycling through primary/accent/muted shades
  const colors = [
    'bg-primary/10 text-primary',
    'bg-accent/20 text-accent-foreground',
    'bg-secondary text-primary',
    'bg-primary/15 text-primary',
    'bg-accent/15 text-accent-foreground',
    'bg-muted text-primary',
    'bg-primary/10 text-primary',
    'bg-secondary text-primary',
  ]

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground tracking-tight">Categorias</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">Explora por seccion</p>
        </div>
        <Link href="/products" className="text-sm text-primary hover:underline font-medium tracking-wide">
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
              className="flex flex-col items-center gap-2.5 p-4 bg-card border border-border rounded-sm hover:border-primary hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className={`w-11 h-11 rounded-sm flex items-center justify-center ${colorClass} group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200`}>
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
