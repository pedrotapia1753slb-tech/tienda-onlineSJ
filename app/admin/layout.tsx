import { LayoutDashboard, Tags, LogOut, ArrowLeft, ShoppingBag, Settings, Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-muted/30">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r border-border flex flex-col hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b border-border">
                    <Link href="/" className="font-serif text-xl font-bold text-foreground">
                        NovaShop<span className="text-primary">Admin</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </Link>
                    <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground">
                        <ShoppingBag className="w-5 h-5" />
                        Pedidos
                    </Link>
                    <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground">
                        <Users className="w-5 h-5" />
                        Usuarios
                    </Link>
                    <Link href="/admin/categories" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground">
                        <Tags className="w-5 h-5" />
                        Categorias
                    </Link>
                    <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground">
                        <Settings className="w-5 h-5" />
                        Configuración
                    </Link>
                </nav>

                <div className="p-4 border-t border-border">
                    <Button variant="ghost" className="w-full justify-start text-muted-foreground mb-2" asChild>
                        <Link href="/">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Volver a la Tienda
                        </Link>
                    </Button>
                    <form action="/auth/logout" method="post">
                        <Button variant="destructive" className="w-full justify-start" type="submit">
                            <LogOut className="w-4 h-4 mr-2" />
                            Cerrar Sesion Admin
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="h-16 bg-card border-b border-border flex items-center px-4 md:hidden">
                    <Link href="/admin" className="font-serif text-lg font-bold">
                        NovaShop<span className="text-primary">Admin</span>
                    </Link>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
