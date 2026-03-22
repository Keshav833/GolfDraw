import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const country = searchParams.get('country');
  const search = searchParams.get('search');

  const cookieStore = cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } });
  
  let query = supabase.from('charities').select('*').eq('is_active', true);

  if (category) query = query.eq('category', category);
  if (country) query = query.eq('country', country);
  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error } = await query.order('name');
  
  if (error) return NextResponse.json({ data: null, error: { message: error.message, code: 'DB_ERR' } }, { status: 500 });
  return NextResponse.json({ data, error: null });
}
