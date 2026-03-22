import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { full_name } = await req.json();
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json(
        { data: null, error: { message: 'Unauthorized', code: '401' } },
        { status: 401 }
      );

    const { data, error } = await supabase
      .from('users')
      .update({ full_name })
      .eq('id', user.id)
      .select()
      .single();
    if (error)
      return NextResponse.json(
        { data: null, error: { message: error.message, code: 'DB_ERR' } },
        { status: 500 }
      );

    return NextResponse.json({ data, error: null });
  } catch (err: any) {
    return NextResponse.json(
      { data: null, error: { message: err.message, code: 'ERR' } },
      { status: 500 }
    );
  }
}
