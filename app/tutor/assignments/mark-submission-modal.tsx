'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { markAssignment } from '@/app/actions/assignments';
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

type MarkSubmissionModalProps = {
  submissionId: string;
  studentName: string;
  hasMarked: boolean;
};

export function MarkSubmissionModal({
  submissionId,
  studentName,
  hasMarked,
}: MarkSubmissionModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedbackText, setFeedbackText] = useState('');
  const [marks, setMarks] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function resetForm() {
    setFeedbackText('');
    setMarks('');
    setSelectedFile(null);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={hasMarked ? 'outline' : 'default'} className="h-8 px-3 text-xs">
          {hasMarked ? 'Update Mark' : 'Mark Work'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogTitle className="text-lg font-semibold text-slate-900 sm:text-xl">
          Mark {studentName}'s Work
        </DialogTitle>
        <DialogDescription>
          Provide marks and feedback (text and/or PDF).
        </DialogDescription>

        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();

            const marksNum = marks ? parseInt(marks, 10) : null;
            const feedbackTextTrimmed = feedbackText.trim();

            if (!marksNum && !feedbackTextTrimmed && !selectedFile) {
              toast.error('Please provide marks, feedback text, or upload a feedback PDF.');
              return;
            }

            if (feedbackTextTrimmed && feedbackTextTrimmed.length > 500) {
              toast.error('Feedback text must not exceed 500 characters.');
              return;
            }

            startTransition(async () => {
              const result = await markAssignment(
                submissionId,
                marksNum,
                feedbackTextTrimmed || null,
                selectedFile
              );

              if (!result.ok) {
                toast.error(result.error);
                return;
              }

              toast.success('Submission marked successfully!');
              resetForm();
              setOpen(false);
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="marks">Marks</Label>
            <Input
              id="marks"
              type="number"
              min="0"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              placeholder="e.g., 85"
            />
            <p className="text-xs text-slate-500">Optional. Enter mark out of 100 or your grading scale.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback_text">Feedback (Text)</Label>
            <textarea
              id="feedback_text"
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Provide constructive feedback to the student..."
              className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
            />
            <p className="text-xs text-slate-500">{feedbackText.length}/500 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback_pdf">Feedback (PDF)</Label>
            <Input
              id="feedback_pdf"
              type="file"
              accept=".pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-slate-500">Optional. Upload a PDF with detailed feedback.</p>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Marking...' : 'Mark Submission'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
