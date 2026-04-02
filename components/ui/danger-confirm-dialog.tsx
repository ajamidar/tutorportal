'use client';

import { useEffect, useId, useState } from 'react';
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

type DangerConfirmDialogProps = {
  triggerLabel: string;
  title: string;
  description: string;
  keyword?: string;
  acknowledgeLabel?: string;
  confirmLabel: string;
  pendingLabel: string;
  disabled?: boolean;
  triggerClassName?: string;
  onConfirm: () => Promise<boolean>;
};

export function DangerConfirmDialog({
  triggerLabel,
  title,
  description,
  keyword = 'DELETE',
  acknowledgeLabel = 'I understand this cannot be undone.',
  confirmLabel,
  pendingLabel,
  disabled = false,
  triggerClassName,
  onConfirm,
}: DangerConfirmDialogProps) {
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState('');

  useEffect(() => {
    if (!open) {
      setIsAcknowledged(false);
      setConfirmationInput('');
      setIsPending(false);
    }
  }, [open]);

  const canConfirm =
    isAcknowledged && confirmationInput.trim().toUpperCase() === keyword.toUpperCase() && !isPending;

  async function handleConfirm() {
    if (!canConfirm) {
      return;
    }

    setIsPending(true);
    try {
      const isSuccess = await onConfirm();
      if (isSuccess) {
        setOpen(false);
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive" className={triggerClassName} disabled={disabled}>
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogTitle className="text-lg font-semibold text-slate-900">{title}</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-slate-600">{description}</DialogDescription>

        <div className="mt-4 space-y-4">
          <label className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
              checked={isAcknowledged}
              onChange={(event) => setIsAcknowledged(event.target.checked)}
            />
            <span className="text-sm text-slate-700">{acknowledgeLabel}</span>
          </label>

          <div className="space-y-2">
            <Label htmlFor={inputId}>Type {keyword} to continue</Label>
            <Input
              id={inputId}
              value={confirmationInput}
              onChange={(event) => setConfirmationInput(event.target.value)}
              placeholder={keyword}
              autoComplete="off"
            />
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" disabled={!canConfirm} onClick={handleConfirm}>
              {isPending ? pendingLabel : confirmLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
