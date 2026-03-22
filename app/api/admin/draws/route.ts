import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()

    const { data: drawsData, error } = await supabaseAdmin
      .from('draws')
      .select(`
        *,
        draw_results (
          id
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    const draws = drawsData?.map(d => ({
      ...d,
      winner_count: d.draw_results?.length || 0
    }))

    return NextResponse.json({
      data: draws,
      error: null
    })

  } catch (err: any) {
    console.error('Draws API Error:', err)
    const status = err.message === 'UNAUTHENTICATED' ? 401 : err.message === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json(
      { data: null, error: { message: err.message } },
      { status }
    )
  }
}
