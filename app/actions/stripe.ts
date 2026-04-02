'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getStripeServerClient } from '@/utils/stripe/server';

function getAppBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

export async function createStripeConnectAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?error=You+must+be+logged+in');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, stripe_connect_id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    redirect(`/tutor/billing?error=${encodeURIComponent(profileError.message)}`);
  }

  if (!profile) {
    redirect('/tutor/billing?error=Tutor+profile+not+found');
  }

  const stripe = getStripeServerClient();

  let connectedAccountId = profile.stripe_connect_id;

  if (!connectedAccountId) {
    const account = await stripe.accounts.create({
      type: 'standard',
      metadata: {
        tutor_profile_id: profile.id,
      },
    });

    connectedAccountId = account.id;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        stripe_connect_id: connectedAccountId,
        stripe_onboarding_complete: false,
      })
      .eq('id', profile.id);

    if (updateError) {
      redirect(`/tutor/billing?error=${encodeURIComponent(updateError.message)}`);
    }
  }

  const baseUrl = getAppBaseUrl();
  const callbackUrl = `${baseUrl}/api/stripe/callback?account=${encodeURIComponent(connectedAccountId)}`;

  const accountLink = await stripe.accountLinks.create({
    account: connectedAccountId,
    type: 'account_onboarding',
    refresh_url: `${baseUrl}/tutor/billing?connect=refresh`,
    return_url: callbackUrl,
  });

  redirect(accountLink.url);
}
