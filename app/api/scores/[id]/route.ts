import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: { message: 'Unauthorized', code: '401' } }, { status: 401 });

  const { error } = await supabase.from('scores').delete().eq('id', params.id).eq('user_id', user.id);
  if (error) return NextResponse.json({ data: null, error: { message: error.message, code: 'DB_ERR' } }, { status: 500 });
  
  return NextResponse.json({ data: 'success', error: null });
}
