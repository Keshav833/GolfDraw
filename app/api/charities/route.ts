import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { Charity } from '@/lib/types/charity';

export const revalidate = 3600;

type CharityApiResponse = {
  data: { charities: Charity[] } | null;
  error: { message: string; code?: string } | null;
};

function jsonResponse(body: CharityApiResponse, status: number) {
  return NextResponse.json(body, { status });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim();
    const category = searchParams.get('category')?.trim();

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

    let query = supabase
      .from('charities')
      .select('id, name, description, category, country, is_active, created_at')
      .eq('is_active', true);

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('name', { ascending: true });

    if (error) {
      return jsonResponse(
        { data: null, error: { message: error.message, code: 'DB_ERR' } },
        500
      );
    }

    return jsonResponse({ data: { charities: (data ?? []) as Charity[] }, error: null }, 200);
  } catch (error: any) {
    return jsonResponse(
      { data: null, error: { message: error.message ?? 'Server error', code: 'ERR' } },
      500
    );
  }
}
