'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
    Package, CheckCircle, XCircle, Eye, QrCode, Banknote,
    User, Clock, ImageIcon, ExternalLink, ChevronDown, ChevronUp, X, Truck
} from 'lucide-react'
import Image from 'next/image'

type OrderWithDetails = {
    id: string
    buyer_id: string
    delivery_id: string | null
    status: string
    total: number
    delivery_address: string | null
    address_code: string | null
    notes: string | null
    payment_method: string | null
    payment_proof_url: string | null
    payment_status: string | null
    created_at: string
    profiles: {
        full_name: string | null
        email: string | null
        phone: string | null
        avatar_url: string | null
    } | null
    delivery: { full_name: string | null; phone: string | null } | null
    order_items: {
        id: string
        quantity: number
        unit_price: number
        total: number
        products: {
            name: string
            images: string[]
        } | null
    }[]
}

type DeliveryOption = { id: string; full_name: string | null; phone: string | null }

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    confirmed: { label: 'Confirmado', className: 'bg-blue-100 text-blue-700 border-blue-200' },
    shipped: { label: 'Enviado', className: 'bg-purple-100 text-purple-700 border-purple-200' },
    delivered: { label: 'Entregado', className: 'bg-green-100 text-green-700 border-green-200' },
    cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700 border-red-200' },
}

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    pending: { label: 'Sin verificar', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    verified: { label: 'Verificado', className: 'bg-green-100 text-green-700 border-green-200' },
    rejected: { label: 'Rechazado', className: 'bg-red-100 text-red-700 border-red-200' },
}

type FilterType = 'all' | 'pending_payment' | 'verified' | 'rejected'

export default function OrdersClient({ initialOrders, deliveryOptions }: { initialOrders: OrderWithDetails[]; deliveryOptions: DeliveryOption[] }) {
    const [orders, setOrders] = useState(initialOrders)
    const [filter, setFilter] = useState<FilterType>('all')
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
    const [proofModal, setProofModal] = useState<string | null>(null)
    const [updatingId, setUpdatingId] = useState<string | null>(null)

    const supabase = createClient()

    async function assignDelivery(orderId: string, deliveryId: string | null) {
        setUpdatingId(orderId)
        const { error } = await supabase
            .from('orders')
            .update({ delivery_id: deliveryId })
            .eq('id', orderId)
        if (error) {
            toast.error('Error: ' + error.message)
        } else {
            const delivery = deliveryId ? deliveryOptions.find((d) => d.id === deliveryId) ?? null
            setOrders((prev) =>
                prev.map((o) =>
                    o.id === orderId
                        ? { ...o, delivery_id: deliveryId, delivery: delivery ? { full_name: delivery.full_name, phone: delivery.phone } : null }
                        : o
                )
            )
            toast.success(deliveryId ? 'Delivery asignado' : 'Delivery quitado')
        }
        setUpdatingId(null)
    }

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true
        if (filter === 'pending_payment') return order.payment_method === 'qr' && order.payment_status !== 'verified'
        if (filter === 'verified') return order.payment_status === 'verified'
        if (filter === 'rejected') return order.payment_status === 'rejected'
        return true
    })

    async function updatePaymentStatus(orderId: string, paymentStatus: 'verified' | 'rejected') {
        setUpdatingId(orderId)

        const updateData: any = { payment_status: paymentStatus }
        // If verified, also confirm the order
        if (paymentStatus === 'verified') {
            updateData.status = 'confirmed'
        }

        const { error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId)

        if (error) {
            toast.error('Error al actualizar: ' + error.message)
        } else {
            setOrders(prev => prev.map(o =>
                o.id === orderId
                    ? { ...o, payment_status: paymentStatus, ...(paymentStatus === 'verified' ? { status: 'confirmed' } : {}) }
                    : o
            ))
            toast.success(paymentStatus === 'verified' ? 'Pago verificado y pedido confirmado' : 'Pago rechazado')
        }

        setUpdatingId(null)
    }

    async function updateOrderStatus(orderId: string, status: string) {
        setUpdatingId(orderId)
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId)

        if (error) {
            toast.error('Error: ' + error.message)
        } else {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
            toast.success(`Estado cambiado a: ${STATUS_CONFIG[status]?.label ?? status}`)
        }
        setUpdatingId(null)
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {([
                    { key: 'all', label: 'Todos', count: orders.length },
                    { key: 'pending_payment', label: 'Pagos pendientes', count: orders.filter(o => o.payment_method === 'qr' && o.payment_status !== 'verified').length },
                    { key: 'verified', label: 'Verificados', count: orders.filter(o => o.payment_status === 'verified').length },
                    { key: 'rejected', label: 'Rechazados', count: orders.filter(o => o.payment_status === 'rejected').length },
                ] as { key: FilterType; label: string; count: number }[]).map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.key
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                            }`}
                    >
                        {f.label}
                        <span className="ml-1.5 text-xs opacity-70">({f.count})</span>
                    </button>
                ))}
            </div>

            {/* Orders list */}
            {filteredOrders.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-12 text-center">
                    <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No hay pedidos en esta categoría.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredOrders.map(order => {
                        const isExpanded = expandedOrder === order.id
                        const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, className: 'bg-gray-100 text-gray-700' }
                        const paymentStatusCfg = PAYMENT_STATUS_CONFIG[order.payment_status ?? 'pending']

                        return (
                            <div key={order.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                                {/* Order header */}
                                <button
                                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors text-left"
                                >
                                    {/* Buyer avatar */}
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <User className="w-5 h-5 text-primary" />
                                    </div>

                                    {/* Buyer info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-medium text-sm text-foreground">
                                                {order.profiles?.full_name ?? 'Sin nombre'}
                                            </p>
                                            <span className="text-xs text-muted-foreground">
                                                #{order.id.slice(0, 8).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(order.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                {order.payment_method === 'qr' ? (
                                                    <><QrCode className="w-3 h-3" /> QR</>
                                                ) : (
                                                    <><Banknote className="w-3 h-3" /> Efectivo</>
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-foreground">Bs {Number(order.total).toFixed(0)}</p>
                                        <p className="text-xs text-muted-foreground">{order.order_items?.length ?? 0} items</p>
                                    </div>

                                    {/* Badges */}
                                    <div className="flex flex-col gap-1 shrink-0 items-end">
                                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium border ${statusCfg.className}`}>
                                            {statusCfg.label}
                                        </span>
                                        {order.payment_method === 'qr' && (
                                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium border ${paymentStatusCfg.className}`}>
                                                {paymentStatusCfg.label}
                                            </span>
                                        )}
                                    </div>

                                    {/* Expand icon */}
                                    <div className="shrink-0 text-muted-foreground">
                                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </div>
                                </button>

                                {/* Expanded details */}
                                {isExpanded && (
                                    <div className="px-5 pb-5 border-t border-border pt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                        {/* Order items */}
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

                                        {/* Assign delivery */}
                                        <div>
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Asignar delivery</p>
                                            {order.delivery ? (
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="inline-flex items-center gap-1.5 text-sm text-foreground bg-purple-50 text-purple-700 border border-purple-200 rounded-lg px-2.5 py-1.5">
                                                        <Truck className="w-3.5 h-3.5" />
                                                        {order.delivery.full_name ?? 'Sin nombre'} {order.delivery.phone ? `· ${order.delivery.phone}` : ''}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-7 text-xs"
                                                        onClick={() => assignDelivery(order.id, null)}
                                                        disabled={updatingId === order.id}
                                                    >
                                                        Quitar
                                                    </Button>
                                                </div>
                                            ) : (
                                                <select
                                                    className="w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                                    value=""
                                                    onChange={e => {
                                                        const v = e.target.value
                                                        if (v) assignDelivery(order.id, v)
                                                    }}
                                                    disabled={updatingId === order.id || deliveryOptions.length === 0}
                                                >
                                                    <option value="">
                                                        {deliveryOptions.length === 0 ? 'No hay repartidores' : 'Seleccionar repartidor...'}
                                                    </option>
                                                    {deliveryOptions.map(d => (
                                                        <option key={d.id} value={d.id}>
                                                            {d.full_name ?? d.id.slice(0, 8)} {d.phone ? `· ${d.phone}` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>

                                        {/* Delivery info */}
                                        {order.delivery_address && (
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Entrega</p>
                                                <p className="text-sm text-foreground">{order.delivery_address}</p>
                                                {order.address_code && (
                                                    <a
                                                        href={`https://plus.codes/${order.address_code}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        Ver ubicación ({order.address_code})
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        {order.notes && (
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Notas</p>
                                                <p className="text-sm text-muted-foreground">{order.notes}</p>
                                            </div>
                                        )}

                                        {/* Payment proof (for QR payments) */}
                                        {order.payment_method === 'qr' && (
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Comprobante de pago</p>
                                                {order.payment_proof_url ? (
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => setProofModal(order.payment_proof_url!)}
                                                            className="relative w-20 h-20 rounded-xl overflow-hidden bg-secondary border border-border hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                                                        >
                                                            <Image
                                                                src={order.payment_proof_url}
                                                                alt="Comprobante"
                                                                fill
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                                <Eye className="w-5 h-5 text-white" />
                                                            </div>
                                                        </button>
                                                        <div className="space-y-1.5">
                                                            <Button
                                                                size="sm"
                                                                className="gap-1.5 h-8"
                                                                onClick={() => updatePaymentStatus(order.id, 'verified')}
                                                                disabled={updatingId === order.id || order.payment_status === 'verified'}
                                                            >
                                                                <CheckCircle className="w-3.5 h-3.5" />
                                                                Verificar pago
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                className="gap-1.5 h-8"
                                                                onClick={() => updatePaymentStatus(order.id, 'rejected')}
                                                                disabled={updatingId === order.id || order.payment_status === 'rejected'}
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" />
                                                                Rechazar
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 rounded-xl p-3">
                                                        <ImageIcon className="w-4 h-4" />
                                                        El cliente aún no ha subido su comprobante.
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Order status change */}
                                        <div>
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Cambiar estado del pedido</p>
                                            <div className="flex flex-wrap gap-2">
                                                {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => {
                                                    const cfg = STATUS_CONFIG[s]
                                                    const isActive = order.status === s
                                                    return (
                                                        <button
                                                            key={s}
                                                            onClick={() => !isActive && updateOrderStatus(order.id, s)}
                                                            disabled={isActive || updatingId === order.id}
                                                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${isActive
                                                                ? cfg.className + ' ring-1 ring-offset-1'
                                                                : 'bg-secondary/50 text-muted-foreground border-border hover:bg-secondary'
                                                                } ${isActive ? 'cursor-default' : 'cursor-pointer'}`}
                                                        >
                                                            {cfg.label}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Proof Image Modal */}
            {proofModal && (
                <div
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
                    onClick={() => setProofModal(null)}
                >
                    <div className="relative max-w-lg w-full max-h-[80vh]" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setProofModal(null)}
                            className="absolute -top-3 -right-3 w-8 h-8 bg-card border border-border rounded-full flex items-center justify-center hover:bg-secondary z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="bg-white rounded-2xl overflow-hidden border border-border">
                            <Image
                                src={proofModal}
                                alt="Comprobante de pago"
                                width={800}
                                height={800}
                                className="w-full h-auto object-contain max-h-[75vh]"
                                unoptimized
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
