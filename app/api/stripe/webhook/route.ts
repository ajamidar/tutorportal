import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getStripeServerClient } from '@/utils/stripe/server';
import { createAdminClient } from '@/utils/supabase/admin';

export const runtime = 'nodejs';

function getWebhookSecret() {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured.');
  }

  return secret;
}

async function markInvoicePaidByPaymentLink(paymentLinkId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('stripe_payment_link_id', paymentLinkId)
    .eq('status', 'unpaid');

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/tutor/billing');
  revalidatePath('/portal/dashboard');
  revalidatePath('/portal/billing');
}

export async function POST(request: Request) {
  const stripe = getStripeServerClient();
  const webhookSecret = getWebhookSecret();
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid webhook signature.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const paymentLinkId =
        typeof session.payment_link === 'string' ? session.payment_link : session.payment_link?.id;

      if (session.payment_status === 'paid' && paymentLinkId) {
        await markInvoicePaidByPaymentLink(paymentLinkId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook handling failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}