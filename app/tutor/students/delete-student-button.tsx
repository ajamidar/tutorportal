'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { deleteClientProfile } from '@/app/actions/students';
import { Button } from '@/components/ui/button';

type DeleteStudentButtonProps = {
  id: string;
  label: string;
};

export function DeleteStudentButton({ id, label }: DeleteStudentButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={isPending}
      onClick={() => {
        const confirmed = window.confirm(`Delete "${label}" from your roster?`);
        if (!confirmed) return;

        startTransition(async () => {
          const result = await deleteClientProfile(id);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success('Student entry deleted.');
        });
      }}
    >
      {isPending ? 'Deleting...' : 'Delete'}
    </Button>
  );
}
