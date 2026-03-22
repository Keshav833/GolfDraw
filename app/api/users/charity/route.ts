import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function PATCH(req: Request) {
  try {
    const { charity_id, charity_contribution_pct } = await req.json();
    const cookieStore = cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ data: null, error: { message: 'Unauthorized', code: '401' } }, { status: 401 });

    const allowedPcts = new Set([10, 15, 30]);
    const parsedPct = Number(charity_contribution_pct);
    const pct = parsedPct === 0 ? 0 : allowedPcts.has(parsedPct) ? parsedPct : 0;
    const updates: { charity_contribution_pct: number; charity_id?: string | null } = {
      charity_contribution_pct: pct
    };

    if (typeof charity_id !== 'undefined') {
      updates.charity_id =
        typeof charity_id === 'string' && charity_id.trim().length > 0 ? charity_id : null;
    }

    const { data, error } = await supabase.from('users').update(updates).eq('id', user.id).select().single();

    if (error) return NextResponse.json({ data: null, error: { message: error.message, code: 'DB_ERR' } }, { status: 500 });
    return NextResponse.json({ data, error: null });
  } catch (err: any) {
    return NextResponse.json({ data: null, error: { message: err.message, code: 'ERR' } }, { status: 500 });
  }
}
