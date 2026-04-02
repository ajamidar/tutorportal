import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getStripeServerClient } from '@/utils/stripe/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const accountId = searchParams.get('account');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login?error=Please+sign+in+again', request.url));
  }

  if (!accountId) {
    return NextResponse.redirect(new URL('/tutor/billing?error=Missing+Stripe+account+id', request.url));
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('stripe_connect_id')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.redirect(
      new URL(`/tutor/billing?error=${encodeURIComponent(profileError.message)}`, request.url)
    );
  }

  if (!profile?.stripe_connect_id || profile.stripe_connect_id !== accountId) {
    return NextResponse.redirect(
      new URL('/tutor/billing?error=Stripe+account+verification+failed', request.url)
    );
  }

  const stripe = getStripeServerClient();

  try {
    const account = await stripe.accounts.retrieve(accountId);

    if (account.id !== accountId) {
      return NextResponse.redirect(new URL('/tutor/billing?error=Stripe+account+mismatch', request.url));
    }

    const onboardingComplete = Boolean(account.details_submitted);

    const { error } = await supabase
      .from('profiles')
      .update({
        stripe_connect_id: account.id,
        stripe_onboarding_complete: onboardingComplete,
      })
      .eq('id', user.id);

    if (error) {
      return NextResponse.redirect(
        new URL(`/tutor/billing?error=${encodeURIComponent(error.message)}`, request.url)
      );
    }

    return NextResponse.redirect(
      new URL(
        onboardingComplete ? '/tutor/billing?connect=success' : '/tutor/billing?connect=incomplete',
        request.url
      )
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Stripe callback failed.';
    return NextResponse.redirect(
      new URL(`/tutor/billing?error=${encodeURIComponent(message)}`, request.url)
    );
  }
}
