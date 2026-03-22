'use client'

import { useQuery } from '@tanstack/react-query'
import StatCards from '@/components/admin/analytics/StatCards'
import SubscriptionChart from '@/components/admin/analytics/SubscriptionChart'
import DrawHistoryTable from '@/components/admin/analytics/DrawHistoryTable'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminDashboard() {
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch analytics')
      return json.data
    }
  })

  if (isLoading) return <DashboardSkeleton />
  if (error) return <div className="p-10 text-center text-red-500">Error: {(error as Error).message}</div>

  return (
    <div className="space-y-10 pb-20">
      <header>
        <h1 className="text-3xl font-serif text-[var(--text)] mb-2">Overview</h1>
        <p className="text-sm text-[var(--text-muted)]">Platform analytics and performance summary.</p>
      </header>

      {/* Row 1: Stats */}
      {analytics && <StatCards data={analytics} />}

      {/* Row 2: Chart */}
      <div className="grid grid-cols-1 gap-8">
        {analytics?.trend && <SubscriptionChart data={analytics.trend} />}
      </div>

      {/* Row 3: Draw History */}
      <section className="space-y-6">
        <h2 className="text-xl font-serif">Recent Draw History</h2>
        {analytics?.draws && <DrawHistoryTable data={analytics.draws} />}
      </section>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="h-10 w-48 bg-[var(--sd)]/20 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-40 bg-[var(--sd)]/20 rounded-2xl shadow-[var(--raised-sm)]" />)}
      </div>
      <div className="h-[250px] bg-[var(--sd)]/20 rounded-2xl shadow-[var(--raised-sm)]" />
      <div className="h-[400px] bg-[var(--sd)]/20 rounded-3xl shadow-[var(--raised-sm)]" />
    </div>
  )
}
