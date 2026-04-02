'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { createInvoice } from '@/app/actions/billing';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CopyLinkButton } from './copy-link-button';

type ClientOption = {
  clientProfileId: string;
  studentName: string;
  clientEmail: string;
};

type CreateInvoiceModalProps = {
  clients: ClientOption[];
  stripeReady: boolean;
};

export function CreateInvoiceModal({ clients, stripeReady }: CreateInvoiceModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.clientProfileId ?? '');
  const [amountGbp, setAmountGbp] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  const hasClients = clients.length > 0 && stripeReady;

  function resetForm() {
    setSelectedClientId(clients[0]?.clientProfileId ?? '');
    setAmountGbp('');
    setGeneratedLink('');
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button disabled={!hasClients}>Create Invoice</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogTitle className="text-lg font-semibold text-slate-900 sm:text-xl">
          Create Invoice
        </DialogTitle>
        <DialogDescription className="sr-only">
          Generate an invoice and Stripe payment link for a selected student.
        </DialogDescription>

        {!stripeReady ? (
          <p className="mt-3 text-sm text-slate-600">
            Connect Stripe first before creating invoice links.
          </p>
        ) : !hasClients ? (
          <p className="mt-3 text-sm text-slate-600">Add a student first before creating invoices.</p>
        ) : (
          <form
            className="mt-4 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();

              const parsedAmount = Number.parseFloat(amountGbp);
              if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
                toast.error('Please enter a valid amount in GBP.');
                return;
              }

              const amountPence = Math.round(parsedAmount * 100);

              startTransition(async () => {
                const result = await createInvoice(selectedClientId, amountPence);

                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }

                toast.success('Invoice created and payment link generated.');
                setGeneratedLink(result.paymentLink ?? '');
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="invoice_client">Client / Student</Label>
              <select
                id="invoice_client"
                value={selectedClientId}
                onChange={(event) => setSelectedClientId(event.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
              >
                {clients.map((client) => (
                  <option key={client.clientProfileId} value={client.clientProfileId}>
                    {client.studentName} ({client.clientEmail})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount_gbp">Amount (GBP)</Label>
              <Input
                id="amount_gbp"
                inputMode="decimal"
                placeholder="45.00"
                value={amountGbp}
                onChange={(event) => setAmountGbp(event.target.value)}
                required
              />
              <p className="text-xs text-slate-500">Converted to pence automatically on submit.</p>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Generating...' : 'Generate Invoice Link'}
            </Button>

            {generatedLink ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">
                  Payment Link Ready
                </p>
                <p className="mt-1 break-all text-xs text-emerald-800">{generatedLink}</p>
                <div className="mt-2 flex items-center gap-2">
                  <CopyLinkButton paymentLink={generatedLink} />
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Create Another
                  </Button>
                </div>
              </div>
            ) : null}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
