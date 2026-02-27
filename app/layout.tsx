import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/lib/cart-context'
import './globals.css'

const _inter = Inter({ subsets: ['latin'] })
const _sora = Sora({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MercadoLocal — Tu Mercado del Pueblo',
  description:
    'Compra y vende productos frescos, artesanias y más de los mejores vendedores de tu comunidad.',
  keywords: ['mercado', 'local', 'pueblo', 'frutas', 'verduras', 'artesanias', 'comida'],
  openGraph: {
    title: 'MercadoLocal',
    description: 'Tu mercado comunitario en línea',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased bg-background text-foreground">
        <CartProvider>
          {children}
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
