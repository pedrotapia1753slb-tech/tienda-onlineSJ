import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Tags, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-foreground">Panel de Control General</h1>
                <p className="text-muted-foreground mt-1">
                    Bienvenido al centro de administración de NovaShop.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Categories Card */}
                <Link href="/admin/categories" className="group block bg-card border border-border shadow-sm rounded-2xl p-6 hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">Categorías</p>
                            <p className="text-sm text-muted-foreground mt-1">Gestiona el catálogo central de estantes y departamentos.</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Tags className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                </Link>

                {/* Placeholders for future growth */}
                <div className="block bg-secondary/50 border border-border/50 rounded-2xl p-6 opacity-60">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-lg font-semibold text-foreground">Vendedores</p>
                            <p className="text-sm text-muted-foreground mt-1">Gestión de cuentas de vendedores (Próximamente).</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-muted-foreground" />
                        </div>
                    </div>
                </div>

                <div className="block bg-secondary/50 border border-border/50 rounded-2xl p-6 opacity-60">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-lg font-semibold text-foreground">Estadísticas</p>
                            <p className="text-sm text-muted-foreground mt-1">Reportes de ventas generales (Próximamente).</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <TrendingUp className="w-5 h-5 text-muted-foreground" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
