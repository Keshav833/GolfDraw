import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const id = params.id

    const { data: draw, error } = await supabaseAdmin
      .from('draws')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !draw) {
      return NextResponse.json({ data: null, error: { message: 'Draw not found' } }, { status: 404 })
    }

    return NextResponse.json({ data: draw, error: null })

  } catch (err: any) {
    console.error('Draw GET Error:', err)
    const status = err.message === 'UNAUTHENTICATED' ? 401 : err.message === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json(
      { data: null, error: { message: err.message } },
      { status }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const id = params.id

    // Check if published
    const { data: draw, error: fetchError } = await supabaseAdmin
      .from('draws')
      .select('status')
      .eq('id', id)
      .single()

    if (fetchError || !draw) {
      return NextResponse.json({ data: null, error: { message: 'Draw not found' } }, { status: 404 })
    }

    if (draw.status === 'published') {
      return NextResponse.json({ data: null, error: { message: 'Cannot delete a published draw' } }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('draws')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({
      data: { deleted: true },
      error: null
    })

  } catch (err: any) {
    console.error('Draw DELETE Error:', err)
    const status = err.message === 'UNAUTHENTICATED' ? 401 : err.message === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json(
      { data: null, error: { message: err.message } },
      { status }
    )
  }
}
