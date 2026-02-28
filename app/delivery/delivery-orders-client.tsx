'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Package, User, MapPin, ExternalLink, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import Image from 'next/image'

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

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    confirmed: { label: 'Confirmado', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    shipped: { label: 'En camino', className: 'bg-purple-100 text-purple-700 border-purple-200' },
    delivered: { label: 'Entregado', className: 'bg-green-100 text-green-700 border-green-200' },
}

export default function DeliveryOrdersClient({ initialOrders }: { initialOrders: OrderRow[] }) {
    const [orders, setOrders] = useState(initialOrders)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const supabase = createClient()

    async function updateStatus(orderId: string, status: 'shipped' | 'delivered') {
        setUpdatingId(orderId)
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId)
        if (error) {
            toast.error('Error: ' + error.message)
        } else {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
            toast.success(status === 'shipped' ? 'Marcado como en camino' : 'Marcado como entregado')
            if (status === 'delivered') setExpandedId(prev => prev === orderId ? null : prev)
        }
        setUpdatingId(null)
    }

    if (orders.length === 0) {
        return (
            <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="font-serif text-xl font-bold text-foreground mb-2">Sin pedidos asignados</h2>
                <p className="text-muted-foreground">
                    El administrador te asignará pedidos desde el panel de Pedidos. Cuando lo haga, aparecerán aquí.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {orders.map(order => {
                const isExpanded = expandedId === order.id
                const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, className: 'bg-gray-100 text-gray-700' }
                return (
                    <div key={order.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : order.id)}
                            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors text-left"
                        >
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-foreground">
                                    {order.profiles?.full_name ?? 'Cliente'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    #{order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <div className="text-right shrink-0">
                                <p className="font-bold text-foreground">Bs {Number(order.total).toFixed(0)}</p>
                                <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium border ${statusCfg.className}`}>
                                    {statusCfg.label}
                                </span>
                            </div>
                            <div className="shrink-0 text-muted-foreground">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                        </button>

                        {isExpanded && (
                            <div className="px-5 pb-5 border-t border-border pt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Productos</p>
                                    {order.order_items?.map(item => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <div className="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-secondary">
                                                {item.products?.images?.[0] ? (
                                                    <Image src={item.products.images[0]} alt={item.products?.name ?? ''} fill className="object-cover" unoptimized />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="w-4 h-4 text-muted-foreground/30" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">{item.products?.name ?? 'Producto'}</p>
                                                <p className="text-xs text-muted-foreground">x{item.quantity} · Bs {Number(item.unit_price).toFixed(0)} c/u</p>
                                            </div>
                                            <p className="text-sm font-semibold text-foreground shrink-0">Bs {Number(item.total).toFixed(0)}</p>
                                        </div>
                                    ))}
                                </div>

                                {order.profiles?.phone && (
                                    <p className="text-sm text-foreground flex items-center gap-2">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        Tel: {order.profiles.phone}
                                    </p>
                                )}

                                {order.delivery_address && (
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" /> Dirección de entrega
                                        </p>
                                        <p className="text-sm text-foreground">{order.delivery_address}</p>
                                        {order.address_code && (
                                            <a
                                                href={`https://plus.codes/${order.address_code}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                Ver en mapa ({order.address_code})
                                            </a>
                                        )}
                                    </div>
                                )}

                                {order.notes && (
                                    <div>
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Notas del cliente</p>
                                        <p className="text-sm text-muted-foreground">{order.notes}</p>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {order.status !== 'shipped' && order.status !== 'delivered' && (
                                        <Button
                                            size="sm"
                                            className="gap-1.5"
                                            onClick={() => updateStatus(order.id, 'shipped')}
                                            disabled={updatingId === order.id}
                                        >
                                            {updatingId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                                            En camino
                                        </Button>
                                    )}
                                    {order.status !== 'delivered' && (
                                        <Button
                                            size="sm"
                                            variant="default"
                                            className="gap-1.5 bg-green-600 hover:bg-green-700"
                                            onClick={() => updateStatus(order.id, 'delivered')}
                                            disabled={updatingId === order.id}
                                        >
                                            {updatingId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                                            Marcar entregado
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
