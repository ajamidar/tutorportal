'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';

export type TutorProfileDetails = {
  email: string;
  full_name: string | null;
};

export async function getTutorProfileDetails(): Promise<TutorProfileDetails | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    email: data?.email ?? user.email ?? '',
    full_name: data?.full_name ?? null,
  };
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function updateTutorProfileDetails(input: { fullName: string; email: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  const email = input.email.trim().toLowerCase();
  const fullName = input.fullName.trim();

  if (!email) {
    return { ok: false, error: 'Email is required.' };
  }

  if (!isValidEmail(email)) {
    return { ok: false, error: 'Enter a valid email address.' };
  }

  const emailChanged = email !== (user.email ?? '').toLowerCase();

  if (emailChanged) {
    const { error: authError } = await supabase.auth.updateUser({ email });

    if (authError) {
      return { ok: false, error: authError.message };
    }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: fullName || null,
      email,
    })
    .eq('id', user.id);

  if (profileError) {
    return { ok: false, error: profileError.message };
  }

  revalidatePath('/tutor/profile');
  revalidatePath('/tutor/dashboard');

  return {
    ok: true,
    emailChanged,
  };
}

export async function deleteTutorAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  const { error } = await supabase.rpc('delete_current_user');

  if (error) {
    return {
      ok: false,
      error:
        error.message ||
        'Could not delete account. Ensure migration 011_account_self_delete_rpc.sql has been applied.',
    };
  }

  await supabase.auth.signOut();
  revalidatePath('/');

  return { ok: true };
}
