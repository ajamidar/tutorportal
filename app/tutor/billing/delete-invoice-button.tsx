'use client';

import { toast } from 'sonner';
import { deleteInvoice } from '@/app/actions/billing';
import { DangerConfirmDialog } from '@/components/ui/danger-confirm-dialog';

type DeleteInvoiceButtonProps = {
  invoiceId: string;
  studentName: string;
};

export function DeleteInvoiceButton({ invoiceId, studentName }: DeleteInvoiceButtonProps) {
  return (
    <DangerConfirmDialog
      triggerLabel="Delete"
      title="Delete Invoice"
      description={`This permanently deletes the invoice for ${studentName}. This cannot be undone.`}
      acknowledgeLabel="I understand this invoice will be permanently deleted."
      confirmLabel="Delete Invoice"
      pendingLabel="Deleting..."
      onConfirm={async () => {
        const result = await deleteInvoice(invoiceId);

        if (!result.ok) {
          toast.error(result.error);
          return false;
        }

        toast.success('Invoice deleted.');
        return true;
      }}
    />
  );
}
