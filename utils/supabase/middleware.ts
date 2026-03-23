import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname === '/login';
  const isPublicFile = pathname.includes('.') || pathname.startsWith('/_next');

  if (!user && !isAuthRoute && !isPublicFile) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const metadataRole = user.user_metadata?.role === 'tutor' ? 'tutor' : 'client';
    const resolvedRole = profile?.role ?? metadataRole;

    const roleHome = resolvedRole === 'tutor' ? '/tutor/dashboard' : '/portal/dashboard';
    const isTutorArea = pathname.startsWith('/tutor');
    const isPortalArea = pathname.startsWith('/portal');
    const isRoleRoot =
      pathname === '/tutor' ||
      pathname === '/portal' ||
      pathname === '/dashboard' ||
      pathname === '/';

    if (resolvedRole === 'client' && isTutorArea) {
      const url = request.nextUrl.clone();
      url.pathname = '/portal/dashboard';
      return NextResponse.redirect(url);
    }

    if (resolvedRole === 'tutor' && isPortalArea) {
      const url = request.nextUrl.clone();
      url.pathname = '/tutor/dashboard';
      return NextResponse.redirect(url);
    }

    if (isAuthRoute || isRoleRoot) {
      const url = request.nextUrl.clone();
      url.pathname = roleHome;
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  return response;
}
