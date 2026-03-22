import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const draw_result_id = searchParams.get('draw_result_id');
  if (!draw_result_id) return NextResponse.json({ data: null, error: { message: 'Missing ID', code: '400' } }, { status: 400 });

  const cookieStore = cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ data: null, error: { message: 'Unauthorized', code: '401' } }, { status: 401 });

  const { data: res } = await supabase.from('draw_results').select('id').eq('id', draw_result_id).eq('user_id', user.id).single();
  if (!res) return NextResponse.json({ data: null, error: { message: 'Forbidden', code: '403' } }, { status: 403 });

  const filePath = `${user.id}/${draw_result_id}-${Date.now()}.png`;
  const { data, error } = await supabase.storage.from('winner-proofs').createSignedUploadUrl(filePath);

  if (error) return NextResponse.json({ data: null, error: { message: error.message, code: 'STORAGE_ERR' } }, { status: 500 });
  
  return NextResponse.json({ data, error: null });
}
