'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { submitAssignment } from '@/app/actions/assignments';
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

type SubmitAssignmentModalProps = {
  assignmentId: string;
  hasSubmitted: boolean;
};

export function SubmitAssignmentModal({ assignmentId, hasSubmitted }: SubmitAssignmentModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function resetForm(form?: HTMLFormElement) {
    if (form) {
      form.reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={`inline-flex h-9 items-center justify-center ${hasSubmitted ? 'bg-green-500 text-white border-green-500 shadow-sm shadow-green-600' : 'bg-red-500 text-white border-red-500 shadow-sm shadow-red-600'} rounded-xl px-3 text-sm font-medium transition hover:bg-opacity-75 `}
        >
          {hasSubmitted ? 'Resubmit Work' : 'Submit Work'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogTitle className="text-lg font-semibold text-slate-900 sm:text-xl">
          Submit Your Work
        </DialogTitle>
        <DialogDescription>
          Upload your completed assignment. You can resubmit anytime before your tutor marks it.
        </DialogDescription>

        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
            const file = fileInput?.files?.[0];

            if (!file) {
              toast.error('Please select a file to submit.');
              return;
            }

            startTransition(async () => {
              const result = await submitAssignment(assignmentId, file);

              if (!result.ok) {
                toast.error(result.error);
                return;
              }

              toast.success('Assignment submitted successfully!');
              resetForm(form);
              setOpen(false);
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="submission_file">Your Work</Label>
            <Input
              id="submission_file"
              name="file"
              type="file"
              required
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            />
            <p className="text-xs text-slate-500">Accepted: PDF, DOC, DOCX, PNG, JPG.</p>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Uploading...' : 'Submit Assignment'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
