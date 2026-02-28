'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Plus, Pencil, Trash2, Package, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { Category } from '@/lib/types'

type CategoriesClientProps = {
    initialCategories: Category[]
}

export default function CategoriesClient({ initialCategories }: CategoriesClientProps) {
    const [categories, setCategories] = useState(initialCategories)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState({
        id: '',
        name: '',
        slug: '',
        description: '',
        icon: 'Package', // default icon
    })

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    function handleOpenModal(cat?: Category) {
        if (cat) {
            setForm({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                description: cat.description || '',
                icon: cat.icon || 'Package',
            })
        } else {
            setForm({ id: '', name: '', slug: '', description: '', icon: 'Package' })
        }
        setIsModalOpen(true)
    }

    // Auto-generate slug from name
    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        const name = e.target.value
        setForm(f => ({
            ...f,
            name,
            slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        }))
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            if (form.id) {
                // Update
                const { error } = await supabase
                    .from('categories')
                    .update({
                        name: form.name,
                        slug: form.slug,
                        description: form.description,
                        icon: form.icon,
                    })
                    .eq('id', form.id)

                if (error) throw error

                toast.success('Categoría actualizada exitosamente')
                setCategories(cats => cats.map(c => c.id === form.id ? { ...c, ...form } : c))
            } else {
                // Insert
                const { data, error } = await supabase
                    .from('categories')
                    .insert({
                        name: form.name,
                        slug: form.slug,
                        description: form.description,
                        icon: form.icon,
                    })
                    .select('*, products(count)')
                    .single()

                if (error) throw error

                toast.success('Categoría creada exitosamente')
                setCategories(cats => [...cats, data as Category])
            }

            setIsModalOpen(false)
        } catch (error: any) {
            console.error('Save category error:', error)
            toast.error(error.message || 'Error al guardar la categoría')
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: string) {
        const confirm = window.confirm('¿Estás seguro de eliminar esta categoría? (Los productos asociados quedarán sin categoría o podrían fallar).')
        if (!confirm) return

        try {
            const { error } = await supabase.from('categories').delete().eq('id', id)
            if (error) throw error

            toast.success('Categoría eliminada')
            setCategories(cats => cats.filter(c => c.id !== id))
        } catch (error: any) {
            console.error('Delete category error:', error)
            toast.error(error.message || 'Error al eliminar la categoría. Probablemente tiene productos asignados que impiden su borrado.')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex bg-card border border-border rounded-2xl overflow-hidden p-6 justify-between items-center shadow-sm">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary" />
                    Directorio de Categorías
                </h2>
                <Button onClick={() => handleOpenModal()} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nueva Categoría
                </Button>
            </div>

            <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-medium">Nombre & Slug</th>
                                <th className="px-6 py-4 font-medium">Descripción</th>
                                <th className="px-6 py-4 font-medium text-center">Productos</th>
                                <th className="px-6 py-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {categories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                        No hay categorías creadas.
                                    </td>
                                </tr>
                            ) : (
                                categories.map(cat => (
                                    <tr key={cat.id} className="hover:bg-secondary/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">{cat.name}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">/{cat.slug}</div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">
                                            {cat.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant="secondary" className="px-2.5">
                                                {/* @ts-ignore - Supabase returns an array for relations when joining */}
                                                {cat.products?.[0]?.count ?? '0'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(cat)}>
                                                    <Pencil className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} className="hover:text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                            <h3 className="font-semibold text-lg text-foreground">
                                {form.id ? 'Editar Categoría' : 'Nueva Categoría'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre visible</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={handleNameChange}
                                    placeholder="Ej. Electrónica y Celulares"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug (URL)</Label>
                                <Input
                                    id="slug"
                                    value={form.slug}
                                    onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                                    placeholder="electronica-y-celulares"
                                    required
                                />
                                <p className="text-xs text-muted-foreground mt-1">Cómo aparecerá en los enlaces: /category/{form.slug || 'slug'}</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción (Opcional)</Label>
                                <Textarea
                                    id="description"
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    placeholder="Sección dedicada a dispositivos móviles..."
                                    rows={3}
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? 'Guardando...' : 'Guardar Categoría'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
