# tutor-portal

## Stripe Webhook Setup (Required for invoice paid status)

To automatically mark invoices as paid after a successful Stripe checkout, configure:

1. Environment variables:
- `STRIPE_WEBHOOK_SECRET` (from Stripe webhook endpoint)
- `SUPABASE_SERVICE_ROLE_KEY` (from Supabase project settings)

2. Stripe webhook endpoint URL:
- `/api/stripe/webhook`

3. Subscribe to events:
- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

If you are using Stripe Connect Standard (connected accounts), enable delivery for connected account events on the webhook endpoint as well.

