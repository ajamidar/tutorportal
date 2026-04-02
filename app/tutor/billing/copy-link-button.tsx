'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type CopyLinkButtonProps = {
  paymentLink: string;
};

export function CopyLinkButton({ paymentLink }: CopyLinkButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(paymentLink);
          toast.success('Payment link copied.');
        } catch {
          toast.error('Could not copy link.');
        }
      }}
    >
      Copy Link
    </Button>
  );
}
