'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type ViewFeedbackModalProps = {
  marks: number | null;
  feedbackText: string | null;
  feedbackPdfUrl: string | null;
  markedDate: string | null;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ViewFeedbackModal({
  marks,
  feedbackText,
  feedbackPdfUrl,
  markedDate,
}: ViewFeedbackModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 px-3 text-xs">
          View Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogTitle className="text-lg font-semibold text-slate-900 sm:text-xl">
          Your Feedback
        </DialogTitle>
        <DialogDescription>
          {markedDate ? formatDate(markedDate) : 'Not yet marked'}
        </DialogDescription>

        <div className="mt-4 space-y-4">
          {marks !== null && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-900">Marks</p>
              <p className="text-2xl font-semibold text-blue-700">{marks}</p>
            </div>
          )}

          {feedbackText && (
            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-900">Tutor's Feedback</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{feedbackText}</p>
            </div>
          )}

          {feedbackPdfUrl && (
            <div>
              <p className="mb-2 text-sm font-medium text-slate-900">Detailed Feedback PDF</p>
              <a
                href={feedbackPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition-all duration-150 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                Download PDF
              </a>
            </div>
          )}

          {!feedbackText && !feedbackPdfUrl && marks === null && (
            <p className="text-sm text-slate-500">No feedback provided yet.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
