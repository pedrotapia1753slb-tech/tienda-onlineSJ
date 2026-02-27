import Link from 'next/link'
import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-serif font-bold text-lg text-primary-foreground">
                M
              </div>
              <div>
                <span className="font-serif font-bold text-lg block leading-none text-primary-foreground">
                  MercadoLocal
                </span>
                <span className="text-xs text-primary-foreground/60">Tu mercado del pueblo</span>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Conectamos a los productores y vendedores locales con su comunidad. Apoya lo local, compra fresco.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="Facebook" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Instagram" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Comprar */}
          <div>
            <h3 className="font-semibold text-sm text-primary-foreground mb-4 uppercase tracking-wide">Comprar</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {[
                { label: 'Todos los productos', href: '/products' },
                { label: 'Frutas y Verduras', href: '/category/frutas-verduras' },
                { label: 'Carnes', href: '/category/carnes-embutidos' },
                { label: 'Artesanias', href: '/category/artesanias' },
                { label: 'Ofertas del dia', href: '/products?featured=true' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Vender */}
          <div>
            <h3 className="font-semibold text-sm text-primary-foreground mb-4 uppercase tracking-wide">Vender</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {[
                { label: 'Registra tu tienda', href: '/auth/register' },
                { label: 'Mi dashboard', href: '/dashboard' },
                { label: 'Mis pedidos', href: '/orders' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold text-sm text-primary-foreground mb-4 uppercase tracking-wide">Contacto</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                Plaza Central, Mercado Municipal
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-primary" />
                (555) 123-4567
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-primary" />
                hola@mercadolocal.mx
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/50">
          <p>© 2025 MercadoLocal. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-primary transition-colors">Terminos</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
