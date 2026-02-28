import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import CategoriesClient from './categories-client'
import type { Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
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

    if (!user) {
        redirect('/auth/login')
    }

    // Pre-fetch categories
    const { data: categories } = await supabase
        .from('categories')
        .select('*, products(count)')
        .order('name')

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-foreground">Gestionar Categorias</h1>
                <p className="text-muted-foreground mt-1">
                    Añade o edita las categorías de tu tienda. Los cambios se verán reflejados al instante.
                </p>
            </div>

            <CategoriesClient initialCategories={(categories as unknown as Category[]) || []} />
        </div>
    )
}
