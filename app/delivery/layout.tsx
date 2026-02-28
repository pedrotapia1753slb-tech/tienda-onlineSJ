import { Truck, Package, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DeliveryLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-muted/30">
            <aside className="w-64 bg-card border-r border-border flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b border-border">
                    <Link href="/delivery" className="font-serif text-xl font-bold text-foreground flex items-center gap-2">
                        <Truck className="w-5 h-5 text-primary" />
                        NovaShop<span className="text-primary">Delivery</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <Link
                        href="/delivery"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                        <Package className="w-5 h-5" />
                        Pedidos asignados
                    </Link>
                </nav>

                <div className="p-4 border-t border-border">
                    <Button variant="outline" className="w-full justify-start text-muted-foreground" asChild>
                        <Link href="/" target="_blank" rel="noopener noreferrer">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Abrir tienda (otra pestaña)
                        </Link>
                    </Button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
                <header className="h-16 bg-card border-b border-border flex items-center px-4 md:hidden">
                    <Link href="/delivery" className="font-serif text-lg font-bold flex items-center gap-2">
                        <Truck className="w-5 h-5 text-primary" />
                        NovaShop<span className="text-primary">Delivery</span>
                    </Link>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
