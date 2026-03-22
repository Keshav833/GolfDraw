import { NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { supabaseAdmin } from '@/lib/supabase/admin'

const charitySchema = z.object({
  name: z.string().min(1),
  description: z.string().max(300).optional(),
  category: z.enum(['Golf & Sport', 'Health & Research', 'Youth & Education', 'Environment']),
  country: z.string().min(1),
  website: z.string().url().optional().or(z.literal('')),
  is_active: z.boolean().default(true)
})

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()

    const { data: charities, error } = await supabaseAdmin
      .from('charities')
      .select(`
        *,
        users:users(id)
      `)
      .order('name')

    if (error) throw error

    // Map member_count
    const mappedCharities = charities?.map(c => ({
      ...c,
      member_count: c.users?.length || 0
    }))

    return NextResponse.json({
      data: { charities: mappedCharities },
      error: null
    })

  } catch (err: any) {
    console.error('Charities GET Error:', err)
    const status = err.message === 'UNAUTHENTICATED' ? 401 : err.message === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json(
      { data: null, error: { message: err.message } },
      { status }
    )
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    
    const body = await request.json()
    const validated = charitySchema.parse(body)

    const { data, error } = await supabaseAdmin
      .from('charities')
      .insert({
        name: validated.name,
        description: validated.description,
        category: validated.category,
        country: validated.country,
        website: validated.website || null,
        is_active: validated.is_active
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      data,
      error: null
    })

  } catch (err: any) {
    console.error('Charities POST Error:', err)
    if (err instanceof z.ZodError) {
      return NextResponse.json({ data: null, error: { message: err.errors[0].message } }, { status: 400 })
    }
    const status = err.message === 'UNAUTHENTICATED' ? 401 : err.message === 'FORBIDDEN' ? 403 : 500
    return NextResponse.json(
      { data: null, error: { message: err.message } },
      { status }
    )
  }
}
