import { getTutorBillingState, getTutorInvoices } from '@/app/actions/billing';
import { getTutorStudents } from '@/app/actions/students';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectStripeButton } from './connect-stripe-button';
import { CopyLinkButton } from './copy-link-button';
import { CreateInvoiceModal } from './create-invoice-modal';
import { DeleteInvoiceButton } from './delete-invoice-button';
import { MonthlyEarningsWidget } from './monthly-earnings-widget';
import { YearlyEarningsChart, type MonthlyDataPoint } from './yearly-earnings-chart';
import { Download } from 'lucide-react';

function formatAmountPounds(amountPence: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amountPence / 100);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default async function TutorBillingPage() {
  const [invoices, students, billingState] = await Promise.all([
    getTutorInvoices(),
    getTutorStudents(),
    getTutorBillingState(),
  ]);

  // ── Compute monthly earnings for current month ──
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthInvoices = invoices.filter((inv) => {
    const d = new Date(inv.created_at);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalPaidPence = thisMonthInvoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount_pence, 0);

  const totalUnpaidPence = thisMonthInvoices
    .filter((inv) => inv.status === 'unpaid')
    .reduce((sum, inv) => sum + inv.amount_pence, 0);

  const paidCount = thisMonthInvoices.filter((inv) => inv.status === 'paid').length;
  const monthLabel = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  // ── Compute yearly earnings (12 months) ──
  const yearlyData: MonthlyDataPoint[] = MONTH_NAMES_SHORT.map((month, idx) => {
    const earned = invoices
      .filter((inv) => {
        const d = new Date(inv.created_at);
        return d.getFullYear() === currentYear && d.getMonth() === idx && inv.status === 'paid';
      })
      .reduce((sum, inv) => sum + inv.amount_pence, 0);

    return { month, earningsPence: earned };
  });

  const groupedClientsMap = new Map<string, { clientProfileId: string; studentName: string; clientEmail: string }>();
  for (const student of students) {
    const key = `${student.client_id}:${student.student_name}:${student.level}`;
    if (!groupedClientsMap.has(key)) {
      groupedClientsMap.set(key, {
        clientProfileId: student.id,
        studentName: student.student_name,
        clientEmail: student.client.email,
      });
    }
  }

  const invoiceClients = Array.from(groupedClientsMap.values()).sort((a, b) =>
    a.studentName.localeCompare(b.studentName)
  );

  return (
    <main className="space-y-5">
      {!billingState.stripe_onboarding_complete ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">Action Required</p>
          <h2 className="mt-1 text-lg font-semibold text-amber-900">
            You must connect your bank account to receive payments.
          </h2>
          <p className="mt-1 text-sm text-amber-800">
            Connect Stripe first, then generate invoice links that pay directly into your account.
          </p>
          <div className="mt-3">
            <ConnectStripeButton
              label={
                billingState.stripe_connect_id
                  ? 'Continue Stripe Onboarding'
                  : 'Connect Your Bank Via Stripe'
              }
            />
          </div>
        </section>
      ) : null}

      {/* ── Earnings Widgets ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <MonthlyEarningsWidget
          totalPaidPence={totalPaidPence}
          totalUnpaidPence={totalUnpaidPence}
          invoiceCount={thisMonthInvoices.length}
          paidCount={paidCount}
          monthLabel={monthLabel}
        />
        <YearlyEarningsChart data={yearlyData} year={currentYear} />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Finance</p>
            <CardTitle>Billing</CardTitle>
          </div>
          <CreateInvoiceModal
            clients={invoiceClients}
            stripeReady={billingState.stripe_onboarding_complete}
          />
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="text-sm font-medium text-slate-700">No invoices generated yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {invoices.map((invoice) => {
                    const status = getStatusPresentation(invoice.status);

                    return (
                      <tr key={invoice.id}>
                        <td className="px-4 py-3 text-sm text-slate-700">{formatDate(invoice.created_at)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{invoice.description}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          <p className="font-medium">{invoice.student_name}</p>
                          <p className="text-xs text-slate-500">{invoice.client_name ?? invoice.client_email}</p>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {formatAmountPounds(invoice.amount_pence)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {invoice.status === 'paid' ? (
                              <a
                                href={`/api/invoices/${invoice.id}/receipt`}
                                className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-300 shadow-sm shadow-slate-300 px-3 text-sm font-medium text-green-700 transition hover:bg-slate-100"
                              >
                                <Download className='h-4 w-4 mr-1'/>Download Receipt
                              </a>
                            ) : null}
                            <CopyLinkButton paymentLink={invoice.stripe_payment_link} />
                            <DeleteInvoiceButton
                              invoiceId={invoice.id}
                              studentName={invoice.student_name}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
