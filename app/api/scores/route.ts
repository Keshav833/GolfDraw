import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { value } = await req.json();
    const cookieStore = cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ data: null, error: { message: 'Unauthorized', code: '401' } }, { status: 401 });

    const val = parseInt(value);
    if (isNaN(val) || val < 1 || val > 45) {
      return NextResponse.json({ data: null, error: { message: 'Invalid score', code: '400' } }, { status: 400 });
    }

    const { error } = await supabase.from('scores').insert({ user_id: user.id, value: val });
    if (error) return NextResponse.json({ data: null, error: { message: error.message, code: 'DB_ERR' } }, { status: 500 });

    const { data } = await supabase.from('scores').select('*').eq('user_id', user.id).order('submitted_at', { ascending: false }).limit(5);

    return NextResponse.json({ data, error: null });
  } catch (err: any) {
    return NextResponse.json({ data: null, error: { message: err.message, code: 'ERR' } }, { status: 500 });
  }
}
