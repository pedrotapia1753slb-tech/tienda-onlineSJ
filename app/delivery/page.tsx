import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DeliveryOrdersClient from './delivery-orders-client'

export const dynamic = 'force-dynamic'

type OrderRow = {
    id: string
    status: string
    total: number
    delivery_address: string | null
    address_code: string | null
    notes: string | null
    created_at: string
    profiles: { full_name: string | null; phone: string | null } | null
    order_items: {
        id: string
        quantity: number
        unit_price: number
        total: number
        products: { name: string; images: string[] } | null
    }[]
}

export default async function DeliveryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: orders } = await supabase
        .from('orders')
        .select(`
            id,
            status,
            total,
            delivery_address,
            address_code,
            notes,
            created_at,
            profiles:buyer_id(full_name, phone),
            order_items(
                id,
                quantity,
                unit_price,
                total,
                products(name, images)
            )
        `)
        .eq('delivery_id', user.id)
        .in('status', ['pending', 'confirmed', 'shipped'])
        .order('created_at', { ascending: false })

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-serif font-bold text-foreground">Pedidos asignados a mí</h1>
                <p className="text-muted-foreground mt-1">
                    Aquí ves los pedidos que el admin te asignó. Marca &quot;En camino&quot; o &quot;Entregado&quot; cuando corresponda.
                </p>
            </div>

            <DeliveryOrdersClient initialOrders={(orders as OrderRow[]) || []} />
        </div>
    )
}
