'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Users, Store, Truck, Shield, User as UserIcon, Loader2 } from 'lucide-react'
import type { Profile } from '@/lib/types'

type FilterType = 'all' | 'seller' | 'normal' | 'delivery'

function getRoleBadges(profile: Profile) {
    const badges: { label: string; className: string }[] = []
    if (profile.is_admin) badges.push({ label: 'Admin', className: 'bg-red-100 text-red-700 border-red-200' })
    if (profile.is_delivery) badges.push({ label: 'Delivery', className: 'bg-purple-100 text-purple-700 border-purple-200' })
    if (profile.is_seller) badges.push({ label: 'Vendedor', className: 'bg-blue-100 text-blue-700 border-blue-200' })
    if (!profile.is_admin && !profile.is_delivery && !profile.is_seller) badges.push({ label: 'Usuario', className: 'bg-gray-100 text-gray-700 border-gray-200' })
    return badges
}

export default function UsersClient({ initialProfiles }: { initialProfiles: Profile[] }) {
    const [profiles, setProfiles] = useState(initialProfiles)
    const [filter, setFilter] = useState<FilterType>('all')
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const supabase = createClient()

    const filtered = profiles.filter(p => {
        if (filter === 'all') return true
        if (filter === 'seller') return p.is_seller
        if (filter === 'normal') return !p.is_seller && !p.is_delivery && !p.is_admin
        if (filter === 'delivery') return p.is_delivery
        return true
    })

    async function toggleDelivery(profile: Profile) {
        if (profile.is_admin) {
            toast.error('Un admin no necesita rol delivery.')
            return
        }
        setUpdatingId(profile.id)
        const newValue = !profile.is_delivery
        const { error } = await supabase
            .from('profiles')
            .update({ is_delivery: newValue })
            .eq('id', profile.id)
        if (error) {
            toast.error('Error: ' + error.message)
        } else {
            setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, is_delivery: newValue } : p))
            toast.success(newValue ? 'Rol delivery asignado' : 'Rol delivery quitado')
        }
        setUpdatingId(null)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {[
                    { key: 'all' as FilterType, label: 'Todos', count: profiles.length },
                    { key: 'seller' as FilterType, label: 'Vendedores', count: profiles.filter(p => p.is_seller).length },
                    { key: 'normal' as FilterType, label: 'Usuarios normales', count: profiles.filter(p => !p.is_seller && !p.is_delivery && !p.is_admin).length },
                    { key: 'delivery' as FilterType, label: 'Delivery', count: profiles.filter(p => p.is_delivery).length },
                ].map(f => (
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

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-secondary/50">
                                <th className="text-left py-3 px-4 font-semibold text-foreground">Usuario</th>
                                <th className="text-left py-3 px-4 font-semibold text-foreground">Contacto</th>
                                <th className="text-left py-3 px-4 font-semibold text-foreground">Roles</th>
                                <th className="text-left py-3 px-4 font-semibold text-foreground">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(profile => {
                                const badges = getRoleBadges(profile)
                                const canToggleDelivery = !profile.is_admin && profile.id
                                const isUpdating = updatingId === profile.id
                                return (
                                    <tr key={profile.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                    <UserIcon className="w-4 h-4 text-primary" />
                                                </div>
                                                <span className="font-medium text-foreground">
                                                    {profile.full_name || 'Sin nombre'}
                                                </span>
                                            </div>
                                            {profile.shop_name && (
                                                <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                                                    <Store className="w-3 h-3" />
                                                    {profile.shop_name}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-muted-foreground">
                                            {profile.phone || '—'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-wrap gap-1">
                                                {badges.map(b => (
                                                    <Badge key={b.label} variant="outline" className={`text-[10px] border ${b.className}`}>
                                                        {b.label}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            {canToggleDelivery && (
                                                <Button
                                                    size="sm"
                                                    variant={profile.is_delivery ? 'secondary' : 'default'}
                                                    className="gap-1.5"
                                                    onClick={() => toggleDelivery(profile)}
                                                    disabled={isUpdating}
                                                >
                                                    {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Truck className="w-3.5 h-3.5" />}
                                                    {profile.is_delivery ? 'Quitar delivery' : 'Hacer delivery'}
                                                </Button>
                                            )}
                                            {profile.is_delivery && (
                                                <a
                                                    href="/delivery"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="ml-2 text-xs text-primary hover:underline"
                                                >
                                                    Abrir panel
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {filtered.length === 0 && (
                <div className="bg-card border border-border rounded-2xl p-12 text-center">
                    <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No hay usuarios en esta categoría.</p>
                </div>
            )}
        </div>
    )
}
