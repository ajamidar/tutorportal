import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// 3-day timeout in milliseconds
const SESSION_TIMEOUT_MS = 3 * 24 * 60 * 60 * 1000;

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
  const isPublicRoute = pathname === '/login' || pathname === '/';
  const isPublicFile = pathname.includes('.') || pathname.startsWith('/_next');

  if (!user && !isPublicRoute && !isPublicFile) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, last_activity')
      .eq('id', user.id)
      .maybeSingle();

    const metadataRole = user.user_metadata?.role === 'tutor' ? 'tutor' : 'client';
    const resolvedRole = profile?.role ?? metadataRole;

    // Check for session timeout (3 days of inactivity)
    if (profile?.last_activity) {
      const lastActivityTime = new Date(profile.last_activity).getTime();
      const currentTime = new Date().getTime();
      const timeSinceLastActivity = currentTime - lastActivityTime;

      if (timeSinceLastActivity > SESSION_TIMEOUT_MS) {
        // Session expired, sign out the user
        await supabase.auth.signOut();
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('reason', 'session_expired');
        return NextResponse.redirect(url);
      }

      // Update last_activity on successful request (but not on every single request to avoid excessive DB writes)
      // Only update if more than 5 minutes have passed since last activity
      const ACTIVITY_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes
      if (timeSinceLastActivity > ACTIVITY_UPDATE_INTERVAL) {
        // Update last_activity in the background (don't await)
        supabase
          .from('profiles')
          .update({ last_activity: new Date().toISOString() })
          .eq('id', user.id)
          .then()
          .catch(() => {
            // Silently fail to update activity - don't break the request
          });
      }
    }

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

    if (isPublicRoute || isRoleRoot) {
      const url = request.nextUrl.clone();
      url.pathname = roleHome;
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  return response;
}
