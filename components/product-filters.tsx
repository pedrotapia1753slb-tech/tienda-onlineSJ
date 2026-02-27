'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import type { Category } from '@/lib/types'

type ProductFiltersProps = {
  categories: Category[]
  currentParams: { sort?: string; min?: string; max?: string; category?: string }
}

function FiltersInner({ categories, currentParams }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [min, setMin] = useState(currentParams.min ?? '')
  const [max, setMax] = useState(currentParams.max ?? '')

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/products?${params.toString()}`)
  }

  function applyPriceFilter() {
    const params = new URLSearchParams(searchParams.toString())
    if (min) params.set('min', min)
    else params.delete('min')
    if (max) params.set('max', max)
    else params.delete('max')
    router.push(`/products?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        defaultValue={currentParams.category ?? 'all'}
        onValueChange={v => updateParam('category', v)}
      >
        <SelectTrigger className="w-44 h-9 text-sm">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las categorias</SelectItem>
          {categories.map(c => (
            <SelectItem key={c.id} value={c.slug}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue={currentParams.sort ?? 'recent'}
        onValueChange={v => updateParam('sort', v)}
      >
        <SelectTrigger className="w-40 h-9 text-sm">
          <SelectValue placeholder="Ordenar" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Mas recientes</SelectItem>
          <SelectItem value="price_asc">Menor precio</SelectItem>
          <SelectItem value="price_desc">Mayor precio</SelectItem>
          <SelectItem value="rating">Mejor calificacion</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1.5">
        <Input
          value={min}
          onChange={e => setMin(e.target.value)}
          placeholder="Min $"
          type="number"
          className="w-20 h-9 text-sm"
        />
        <span className="text-muted-foreground text-xs">—</span>
        <Input
          value={max}
          onChange={e => setMax(e.target.value)}
          placeholder="Max $"
          type="number"
          className="w-20 h-9 text-sm"
        />
        <Button size="sm" variant="outline" onClick={applyPriceFilter} className="h-9">
          OK
        </Button>
      </div>
    </div>
  )
}

export function ProductFilters(props: ProductFiltersProps) {
  return (
    <Suspense fallback={<div className="h-9" />}>
      <FiltersInner {...props} />
    </Suspense>
  )
}
