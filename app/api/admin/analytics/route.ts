import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()

    const today = new Date()
    const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1)

    // a. Subscription counts
    const { data: subCounts } = await supabaseAdmin
      .from('subscriptions')
      .select('status')
      .neq('status', 'cancelled')

    const subscriptions = {
      active: subCounts?.filter(s => s.status === 'active').length || 0,
      past_due: subCounts?.filter(s => s.status === 'past_due').length || 0,
      inactive: subCounts?.filter(s => s.status === 'inactive').length || 0
    }

    // b. MRR
    const { data: activeSubs } = await supabaseAdmin
      .from('subscriptions')
      .select('plan_id')
      .eq('status', 'active')

    const monthlyPlanId = process.env.RAZORPAY_MONTHLY_PLAN_ID
    const mrr = activeSubs?.reduce((acc, sub) => {
      const isMonthly = sub.plan_id === monthlyPlanId
      return acc + (isMonthly ? 9 : 86 / 12.0)
    }, 0) || 0

    // c. Total charity allocated
    const { data: charityAlloc } = await supabaseAdmin
      .from('prize_pool_ledger')
      .select('amount')
    
    const charity_total = charityAlloc?.reduce((acc, entry) => acc + Number(entry.amount), 0) || 0

    // d. Total prizes paid out
    const { data: prizesPaid } = await supabaseAdmin
      .from('draw_results')
      .select('prize_amount')
      .eq('payment_status', 'paid')
    
    const prizes_total = prizesPaid?.reduce((acc, entry) => acc + Number(entry.prize_amount), 0) || 0

    // e. Subscription trend (last 12 months)
    const { data: trendData } = await supabaseAdmin
      .from('subscriptions')
      .select('status, created_at')
      .gte('created_at', twelveMonthsAgo.toISOString())
    
    // Group by month
    const trendMap: Record<string, { active: number, cancelled: number }> = {}
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const key = d.toISOString().substring(0, 7) // YYYY-MM
      trendMap[key] = { active: 0, cancelled: 0 }
    }

    trendData?.forEach(sub => {
      const key = sub.created_at.substring(0, 7)
      if (trendMap[key]) {
        if (sub.status === 'active') trendMap[key].active++
        if (sub.status === 'cancelled') trendMap[key].cancelled++
      }
    })

    const trend = Object.entries(trendMap)
      .map(([month, counts]) => ({ month, ...counts }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // f. Draw history summary
    // Fetch draws and join with results in JS for simplicity or use a single select
    const { data: drawsData } = await supabaseAdmin
      .from('draws')
      .select(`
        id,
        month,
        prize_pool_total,
        status,
        draw_results (
          category
        )
      `)
      .eq('status', 'published')
      .order('month', { ascending: false })
      .limit(12)

    const draws = drawsData?.map(d => {
      const results = d.draw_results as any[] || []
      return {
        month: d.month,
        draw_id: d.id,
        status: d.status,
        prize_pool_total: d.prize_pool_total,
        total_winners: results.length,
        jackpot_winners: results.filter(r => r.category === '5-match').length,
        four_match_winners: results.filter(r => r.category === '4-match').length,
        three_match_winners: results.filter(r => r.category === '3-match').length
      }
    }) || []

    return NextResponse.json({
      data: {
        subscriptions,
        mrr,
        charity_total,
        prizes_total,
        trend,
        draws
      },
      error: null
    })

  } catch (err: any) {
    console.error('Analytics Error:', err)
    const status = err.message === 'UNAUTHENTICATED' ? 401 : err.message === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json(
      { data: null, error: { message: err.message } },
      { status }
    )
  }
}
