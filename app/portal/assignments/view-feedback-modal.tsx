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
import { ArrowUpRight } from 'lucide-react';

type ViewFeedbackModalProps = {
  marks: number | null;
  feedbackText: string | null;
  feedbackPdfPath: string | null;
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

function getFeedbackPdfViewerUrl(pdfPath: string) {
  return `/portal/assignments/feedback-pdf?path=${encodeURIComponent(pdfPath)}`;
}

export function ViewFeedbackModal({
  marks,
  feedbackText,
  feedbackPdfPath,
  feedbackPdfUrl,
  markedDate,
}: ViewFeedbackModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="inline-flex h-9 border-slate-600 shadow-sm shadow-slate-700 bg-slate-500 text-white hover:text-white items-center justify-center rounded-xl px-3 text-sm font-medium transition hover:bg-opacity-75">
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

          {feedbackPdfPath && (
            (() => {
              const viewerUrl = getFeedbackPdfViewerUrl(feedbackPdfPath);

              return (
            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-violet-900">Detailed Feedback PDF</p>
                <a
                  href={viewerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-600 bg-slate-500 px-3 text-sm font-medium text-white shadow-sm shadow-slate-700 transition-all duration-150 hover:bg-opacity-75 "
                >
                  Open in new tab <ArrowUpRight className="ml-1 h-4 w-4"/>
                </a>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <iframe
                  src={viewerUrl}
                  title="Tutor feedback PDF"
                  className="h-[60vh] w-full"
                />
              </div>
            </div>
              );
            })()
          )}

          {!feedbackText && !feedbackPdfPath && marks === null && (
            <p className="text-sm text-slate-500">No feedback provided yet.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
