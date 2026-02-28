import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import OrdersClient from './orders-client'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
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

    // Fetch all orders with buyer profiles, delivery (if assigned), and order items
    const { data: orders } = await supabase
        .from('orders')
        .select(`
            *,
            profiles:buyer_id(full_name, email:id, phone, avatar_url),
            delivery:delivery_id(full_name, phone),
            order_items(
                id,
                quantity,
                unit_price,
                total,
                products(name, images)
            )
        `)
        .order('created_at', { ascending: false })
        .limit(100)

    const { data: deliveryProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .eq('is_delivery', true)
        .order('full_name')

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-foreground">Gestionar Pedidos</h1>
                <p className="text-muted-foreground mt-1">
                    Verifica los pagos, asigna delivery y gestiona el estado de los pedidos.
                </p>
            </div>

            <OrdersClient initialOrders={orders || []} deliveryOptions={deliveryProfiles || []} />
        </div>
    )
}
