import type { Metadata } from 'next'
import { DM_Sans, Outfit } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { CartProvider } from '@/lib/cart-context'
import './globals.css'

const _dmSans = DM_Sans({ subsets: ['latin'] })
const _outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NovaShopSJ — Tu Tienda Local',
  description:
    'Compra y vende productos frescos, artesanias y más de los mejores vendedores de tu comunidad.',
  keywords: ['novashop', 'tienda', 'local', 'pueblo', 'frutas', 'verduras', 'artesanias', 'comida'],
  openGraph: {
    title: 'NovaShopSJ',
    description: 'Tu tienda comunitaria en linea',
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
