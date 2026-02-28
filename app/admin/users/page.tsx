import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import UsersClient from './users-client'
import type { Profile } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
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

    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-foreground">Usuarios</h1>
                <p className="text-muted-foreground mt-1">
                    Filtra por tipo de usuario y asigna el rol de delivery para que puedan recibir pedidos de envío.
                </p>
            </div>

            <UsersClient initialProfiles={(profiles as Profile[]) || []} />
        </div>
    )
}
