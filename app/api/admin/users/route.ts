import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const sort = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') || 'desc'
    
    const limit = 20
    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('users')
      .select(`
        id,
        full_name,
        email,
        subscription_status,
        charity_contribution_pct,
        created_at,
        charities (name),
        subscriptions (
          plan_type,
          current_period_end,
          status
        ),
        scores:scores(count),
        draw_results (
          prize_amount,
          payment_status
        )
      `, { count: 'exact' })

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (status !== 'all') {
      query = query.eq('subscription_status', status)
    }

    // Sorting
    // Note: complex sorting on joined fields or aggregations might need raw SQL or RPC
    // For now, we sort by top-level user fields
    if (['created_at', 'full_name', 'email'].includes(sort)) {
      query = query.order(sort, { ascending: order === 'asc' })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data: usersData, count, error } = await query
      .range(offset, offset + limit - 1)

    if (error) throw error

    const users = usersData?.map(u => {
      // Subscriptions: get the non-cancelled one or most recent
      const activeSub = u.subscriptions?.find((s: any) => s.status !== 'cancelled') || u.subscriptions?.[0]
      
      // Calculate total won
      const total_won = u.draw_results?.reduce((acc: number, dr: any) => {
        if (dr.payment_status === 'paid') return acc + Number(dr.prize_amount)
        return acc
      }, 0) || 0

      return {
        id: u.id,
        full_name: u.full_name,
        email: u.email,
        subscription_status: u.subscription_status,
        charity_contribution_pct: u.charity_contribution_pct,
        created_at: u.created_at,
        charity_name: (u.charities as any)?.name,
        plan_type: activeSub?.plan_type,
        current_period_end: activeSub?.current_period_end,
        sub_status: activeSub?.status,
        score_count: (u.scores as any)?.[0]?.count || 0,
        total_won
      }
    })

    return NextResponse.json({
      data: {
        users,
        total: count || 0,
        page
      },
      error: null
    })

  } catch (err: any) {
    console.error('Users API Error:', err)
    const status = err.message === 'UNAUTHENTICATED' ? 401 : err.message === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json(
      { data: null, error: { message: err.message } },
      { status }
    )
  }
}
