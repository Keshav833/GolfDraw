import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
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

  const path = request.nextUrl.pathname;
  const isAdminLogin = path === '/admin/login';
  const isAdminRoute = path.startsWith('/admin') && !isAdminLogin;
  const isUserRoute =
    path.startsWith('/dashboard') ||
    path.startsWith('/scores') ||
    path.startsWith('/charity') ||
    path.startsWith('/draws') ||
    path.startsWith('/account');

  // 1. Admin Login Page — redirect away if already admin
  if (isAdminLogin && user) {
    const role = user.app_metadata?.role;
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // 2. Admin Routes — block non-admins
  if (isAdminRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    const role = user.app_metadata?.role;
    if (role !== 'admin') {
      return NextResponse.redirect(
        new URL('/admin/login?error=access_denied', request.url)
      );
    }
  }

  // 3. User Routes — block unauthenticated
  if (isUserRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return supabaseResponse;
}
