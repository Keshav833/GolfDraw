import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function authMiddleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isApi = request.nextUrl.pathname.startsWith('/api');
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');

  // Protect specific app paths
  const protectedRoots = [
    '/dashboard',
    '/scores',
    '/charity',
    '/draws',
    '/account',
  ];
  const isProtectedApp = protectedRoots.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // API protection (skip public endpoints)
  if (isApi) {
    const publicApis = [
      '/api/auth/register',
      '/api/charities',
      '/api/webhooks/razorpay',
    ];
    // Allow exact matches or sub-paths for public
    const isPublicApi = publicApis.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );
    if (!user && !isPublicApi) {
      return NextResponse.json(
        { error: 'Unauthorized session missing' },
        { status: 401 }
      );
    }
  }

  // App protection
  if (isProtectedApp && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Admin protection
  if (isAdminPath) {
    if (!user || user.app_metadata?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return supabaseResponse;
}
