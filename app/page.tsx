import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import LandingPageClient from './landing-page';

export const metadata = {
  title: 'TutorPortal — Smarter Tutoring, Simplified',
  description:
    'TutorPortal gives tutors a white-label client portal to manage sessions, track student progress, and handle billing — all in one place.',
};

export default async function HomePage() {
  // Redirect authenticated users straight to their dashboard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const metadataRole = user.user_metadata?.role === 'tutor' ? 'tutor' : 'client';
    const resolvedRole = profile?.role ?? metadataRole;
    redirect(resolvedRole === 'tutor' ? '/tutor/dashboard' : '/portal/dashboard');
  }

  return <LandingPageClient />;
}
