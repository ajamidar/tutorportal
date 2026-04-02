'use client';

import { toast } from 'sonner';
import { deleteClientProfile } from '@/app/actions/students';
import { DangerConfirmDialog } from '@/components/ui/danger-confirm-dialog';

type DeleteStudentButtonProps = {
  clientId: string;
  studentName: string;
  level: 'gcse' | 'a_level';
  label: string;
};

export function DeleteStudentButton({ clientId, studentName, level, label }: DeleteStudentButtonProps) {
  return (
    <DangerConfirmDialog
      triggerLabel="Delete Student"
      title="Delete Student"
      description={`This will permanently remove ${label} and all of their subject entries from your roster.`}
      acknowledgeLabel="I understand this student and all subject rows will be permanently removed."
      confirmLabel="Delete Student"
      pendingLabel="Deleting..."
      onConfirm={async () => {
        const result = await deleteClientProfile({ clientId, studentName, level });
        if (!result.ok) {
          toast.error(result.error);
          return false;
        }
        toast.success('Student deleted.');
        return true;
      }}
    />
  );
}
