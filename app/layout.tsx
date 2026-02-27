import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { CartProvider } from '@/lib/cart-context'
import './globals.css'

const _dmSans = DM_Sans({ subsets: ['latin'] })
const _playfair = Playfair_Display({ subsets: ['latin'] })

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
          <Toaster richColors position="bottom-right" />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
