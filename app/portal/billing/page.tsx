import { getClientInvoices } from '@/app/actions/portal';
import { Badge } from '@/components/ui/badge';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatAmountPounds(amountPence: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amountPence / 100);
}

function getStatusPresentation(status: 'unpaid' | 'paid' | 'void') {
  if (status === 'paid') {
    return { label: 'Paid', variant: 'success' as const };
  }

  if (status === 'unpaid') {
    return { label: 'Unpaid', variant: 'warning' as const };
  }

  return { label: 'Void', variant: 'default' as const };
}

export default async function PortalBillingPage() {
  const invoices = await getClientInvoices();

  return (
    <main className="space-y-4">
      <section className="rounded-3xl border border-green-300 shadow-green-400 bg-gradient-to-br from-green-50/80 via-green-50/50 to-green-50/80 p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Billing</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          Payments
        </h1>

        {invoices.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            No invoices yet. Paid and unpaid invoices from your tutor will appear here.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {invoices.map((invoice) => {
              const status = getStatusPresentation(invoice.status);

              return (
                <article key={invoice.id} className="rounded-2xl border border-orange-200 shadow-sm shadow-orange-300 bg-orange-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 sm:text-base">
                        {formatAmountPounds(invoice.amount_pence)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">Issued {formatDate(invoice.created_at)}</p>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>

                  {invoice.status === 'unpaid' ? (
                    <a
                      href={invoice.stripe_payment_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex h-9 items-center justify-center rounded-xl bg-blue-600 px-3 text-sm font-medium text-white transition hover:bg-blue-500"
                    >
                      Pay Now
                    </a>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}