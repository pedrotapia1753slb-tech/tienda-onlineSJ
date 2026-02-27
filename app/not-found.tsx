import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="max-w-lg mx-auto px-4 py-24 text-center">
      <div className="w-20 h-20 rounded-sm bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <span className="font-serif text-4xl font-bold text-primary">M</span>
      </div>
      <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Pagina no encontrada</h1>
      <p className="text-muted-foreground mb-8">
        Lo que buscas no esta aqui, pero tenemos muchos productos frescos esperandote.
      </p>
      <div className="flex gap-3 justify-center">
        <Button asChild className="rounded-sm">
          <Link href="/">Ir al inicio</Link>
        </Button>
        <Button variant="outline" asChild className="rounded-sm">
          <Link href="/products">Ver productos</Link>
        </Button>
      </div>
    </main>
  )
}
