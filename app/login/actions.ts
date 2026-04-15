'use server';

import { redirect } from 'next/navigation';
import { createClient } from '../../utils/supabase/server';

function getAppBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

function getSafeRole(value: FormDataEntryValue | null): 'tutor' | 'client' {
  return value === 'tutor' ? 'tutor' : 'client';
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    redirect('/login?error=Email+and+password+are+required');
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?error=Could+not+load+user+after+sign+in');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    redirect(`/login?error=${encodeURIComponent(profileError.message)}`);
  }

  const metadataRole = user.user_metadata?.role === 'tutor' ? 'tutor' : 'client';
  const resolvedRole = profile?.role ?? metadataRole;

  // Self-heal missing profile rows for legacy users.
  if (!profile) {
    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: user.id,
      role: resolvedRole,
      email: user.email,
      full_name: user.user_metadata?.full_name ?? null,
      last_activity: new Date().toISOString(),
    });

    if (upsertError) {
      redirect(`/login?error=${encodeURIComponent(upsertError.message)}`);
    }
  } else {
    // Update last_activity on login for existing users
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
      // Don't fail the login if we can't update last_activity
      console.error('Failed to update last_activity:', updateError);
    }
  }

  if (resolvedRole === 'tutor') {
    redirect('/tutor/dashboard');
  }

  redirect('/portal/dashboard');
}

export async function signUpAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const fullName = String(formData.get('full_name') ?? '').trim();
  const role = getSafeRole(formData.get('role'));

  if (!email || !password) {
    redirect('/login?error=Email+and+password+are+required');
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        full_name: fullName || null,
      },
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // If email confirmation is enabled, a session may not exist yet..
  if (!data.session) {
    redirect('/login?error=Check+your+email+to+confirm+your+account+then+sign+in');
  }

  const {
    data: { user: newUser },
  } = await supabase.auth.getUser();

  if (newUser) {
    // Set initial last_activity for new users
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', newUser.id);

    if (updateError) {
      // Don't fail the signup flow if we can't update last_activity
      console.error('Failed to set initial last_activity:', updateError);
    }
  }

  redirect(role === 'tutor' ? '/tutor/dashboard' : '/portal/dashboard');
}

export async function sendPasswordResetAction(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();

  if (!email) {
    redirect('/login?mode=reset&error=Email+is+required');
  }

  const supabase = await createClient();
  const redirectTo = `${getAppBaseUrl()}/login/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    redirect(`/login?mode=reset&error=${encodeURIComponent(error.message)}`);
  }

  redirect('/login?mode=reset&sent=1');
}
