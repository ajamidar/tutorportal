'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { getStripeServerClient } from '@/utils/stripe/server';

export type TutorInvoice = {
  id: string;
  client_id: string;
  amount_pence: number;
  status: 'unpaid' | 'paid' | 'void';
  stripe_payment_link: string;
  created_at: string;
  student_name: string;
  client_name: string | null;
  client_email: string;
};

export type TutorBillingState = {
  stripe_connect_id: string | null;
  stripe_onboarding_complete: boolean;
};

async function syncPaidInvoicesForTutor(tutorId: string) {
  const supabase = await createClient();

  const { data: tutorProfile, error: tutorProfileError } = await supabase
    .from('profiles')
    .select('stripe_connect_id, stripe_onboarding_complete')
    .eq('id', tutorId)
    .maybeSingle();

  if (
    tutorProfileError ||
    !tutorProfile?.stripe_connect_id ||
    !tutorProfile.stripe_onboarding_complete
  ) {
    return;
  }

  const { data: unpaidInvoices, error: unpaidInvoicesError } = await supabase
    .from('invoices')
    .select('id, stripe_payment_link_id')
    .eq('tutor_id', tutorId)
    .eq('status', 'unpaid')
    .not('stripe_payment_link_id', 'is', null);

  if (unpaidInvoicesError || !unpaidInvoices?.length) {
    return;
  }

  const stripe = getStripeServerClient();
  const paidInvoiceIds: string[] = [];

  for (const invoice of unpaidInvoices) {
    if (!invoice.stripe_payment_link_id) {
      continue;
    }

    try {
      const sessions = await stripe.checkout.sessions.list(
        {
          payment_link: invoice.stripe_payment_link_id,
          limit: 3,
        },
        { stripeAccount: tutorProfile.stripe_connect_id }
      );

      const hasPaidSession = sessions.data.some((session) => session.payment_status === 'paid');

      if (hasPaidSession) {
        paidInvoiceIds.push(invoice.id);
      }
    } catch {
      // Do not fail the billing page if Stripe reconciliation fails for one invoice.
    }
  }

  if (paidInvoiceIds.length === 0) {
    return;
  }

  await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .in('id', paidInvoiceIds)
    .eq('status', 'unpaid');
}

export async function getTutorBillingState(): Promise<TutorBillingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      stripe_connect_id: null,
      stripe_onboarding_complete: false,
    };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('stripe_connect_id, stripe_onboarding_complete')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    stripe_connect_id: data?.stripe_connect_id ?? null,
    stripe_onboarding_complete: data?.stripe_onboarding_complete ?? false,
  };
}

export async function getTutorInvoices(): Promise<TutorInvoice[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  await syncPaidInvoicesForTutor(user.id);

  const { data, error } = await supabase
    .from('invoices')
    .select(
      'id, client_id, amount_pence, status, stripe_payment_link, created_at, client:client_profiles(student_name, client:profiles!client_profiles_client_id_fkey(full_name, email))'
    )
    .eq('tutor_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => {
    const clientProfile = Array.isArray(row.client) ? row.client[0] : row.client;
    const clientIdentity = Array.isArray(clientProfile?.client)
      ? clientProfile.client[0]
      : clientProfile?.client;

    return {
      id: row.id,
      client_id: row.client_id,
      amount_pence: row.amount_pence,
      status: row.status,
      stripe_payment_link: row.stripe_payment_link,
      created_at: row.created_at,
      student_name: clientProfile?.student_name ?? 'Student',
      client_name: clientIdentity?.full_name ?? null,
      client_email: clientIdentity?.email ?? '',
    };
  });
}

export async function createInvoice(clientId: string, amountPence: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  if (!clientId) {
    return { ok: false, error: 'Please select a client.' };
  }

  if (!Number.isInteger(amountPence) || amountPence <= 0) {
    return { ok: false, error: 'Amount must be a positive value in pence.' };
  }

  const { data: tutorProfile, error: tutorProfileError } = await supabase
    .from('profiles')
    .select('stripe_connect_id, stripe_onboarding_complete')
    .eq('id', user.id)
    .maybeSingle();

  if (tutorProfileError) {
    return { ok: false, error: tutorProfileError.message };
  }

  if (!tutorProfile?.stripe_connect_id || !tutorProfile.stripe_onboarding_complete) {
    return { ok: false, error: 'Connect your Stripe account before creating invoices.' };
  }

  const { data: rosterClient, error: rosterError } = await supabase
    .from('client_profiles')
    .select('id, student_name, subject')
    .eq('id', clientId)
    .eq('tutor_id', user.id)
    .maybeSingle();

  if (rosterError) {
    return { ok: false, error: rosterError.message };
  }

  if (!rosterClient) {
    return { ok: false, error: 'Selected client was not found in your roster.' };
  }

  try {
    const stripe = getStripeServerClient();

    const stripeAccount = tutorProfile.stripe_connect_id;

    const product = await stripe.products.create(
      {
        name: `Tutor invoice: ${rosterClient.student_name}`,
        metadata: {
          tutor_id: user.id,
          client_profile_id: rosterClient.id,
          subject: rosterClient.subject ?? 'General',
        },
      },
      { stripeAccount }
    );

    const price = await stripe.prices.create(
      {
        currency: 'gbp',
        unit_amount: amountPence,
        product: product.id,
      },
      { stripeAccount }
    );

    const paymentLink = await stripe.paymentLinks.create(
      {
        line_items: [{ price: price.id, quantity: 1 }],
        metadata: {
          tutor_id: user.id,
          client_profile_id: rosterClient.id,
        },
      },
      { stripeAccount }
    );

    const { error: insertError } = await supabase.from('invoices').insert({
      tutor_id: user.id,
      client_id: rosterClient.id,
      amount_pence: amountPence,
      stripe_payment_link: paymentLink.url,
      stripe_payment_link_id: paymentLink.id,
      status: 'unpaid',
    });

    if (insertError) {
      return { ok: false, error: insertError.message };
    }

    revalidatePath('/tutor/billing');
    return { ok: true, paymentLink: paymentLink.url };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not create invoice.';
    return { ok: false, error: message };
  }
}

export async function deleteInvoice(invoiceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: 'You must be logged in.' };
  }

  if (!invoiceId) {
    return { ok: false, error: 'Invoice id is required.' };
  }

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId)
    .eq('tutor_id', user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath('/tutor/billing');
  return { ok: true };
}
