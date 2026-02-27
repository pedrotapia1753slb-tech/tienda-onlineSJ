import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { DashboardClient } from '@/components/dashboard-client'
import type { Product } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.is_seller) redirect('/')

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  // Get seller order items
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*, orders(status, created_at, buyer_id), products(name)')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const totalRevenue = (orderItems ?? [])
    .filter((oi: any) => oi.orders?.status !== 'cancelled')
    .reduce((sum: number, oi: any) => sum + (oi.total ?? 0), 0)

  return (
    <>
      <Navbar user={user} profile={profile} />
      <main>
        <DashboardClient
          profile={profile}
          products={(products as Product[]) ?? []}
          categories={categories ?? []}
          orderItems={orderItems ?? []}
          totalRevenue={totalRevenue}
        />
      </main>
      <Footer />
    </>
  )
}
