import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { getEligibleUsers, getPrizePoolTotal, getRolloverAmount } from '@/lib/draw/snapshot'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    await requireAdmin()
    
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')

    if (!month) {
      return NextResponse.json({ data: null, error: { message: 'Month is required' } }, { status: 400 })
    }

    const [eligibleUsers, rollover, calculated] = await Promise.all([
      getEligibleUsers(),
      getRolloverAmount(month),
      getPrizePoolTotal(month)
    ])

    return NextResponse.json({
      data: {
        eligible_count: eligibleUsers.length,
        rollover,
        calculated,
        total: rollover + calculated
      },
      error: null
    })

  } catch (err: any) {
    console.error('Draw Prepare Error:', err)
    const status = err.message === 'UNAUTHENTICATED' ? 401 : err.message === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json(
      { data: null, error: { message: err.message } },
      { status }
    )
  }
}
