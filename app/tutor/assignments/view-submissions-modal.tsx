'use client';

import { useState } from 'react';
import { getTutorAssignmentWithSubmissions, TutorAssignmentWithSubmissions } from '@/app/actions/assignments';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ViewAssignmentSubmissions } from './view-assignment-submissions';
import { Loader2 } from 'lucide-react';

type ViewSubmissionsModalProps = {
  assignmentId: string;
  assignmentTitle: string;
};

export function ViewSubmissionsModal({ assignmentId, assignmentTitle }: ViewSubmissionsModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TutorAssignmentWithSubmissions | null>(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string | null>(null);

  async function handleOpenChange(newOpen: boolean) {
    if (newOpen) {
      setLoading(true);
      try {
        const result = await getTutorAssignmentWithSubmissions(assignmentId);
        setData(result);
        const firstSubmissionWithFile = result?.submissions.find((submission) => submission.submitted_file_url);
        setSelectedFileUrl(firstSubmissionWithFile?.submitted_file_url ?? null);
      } catch (error) {
        console.error('Failed to load submissions:', error);
      } finally {
        setLoading(false);
      }
    }

    if (!newOpen) {
      setSelectedFileUrl(null);
    }

    setOpen(newOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8 px-3 text-xs">
          View Submissions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
        <DialogTitle className="text-lg font-semibold text-slate-900 sm:text-xl">
          {assignmentTitle} - Student Submissions
        </DialogTitle>
        <DialogDescription>
          {data ? `${data.submissions.length} submission(s)` : 'Loading...'}
        </DialogDescription>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            <ViewAssignmentSubmissions
              submissions={data.submissions}
              selectedFileUrl={selectedFileUrl}
              onSelectFile={setSelectedFileUrl}
            />

            <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">File Viewer</p>
                {selectedFileUrl ? (
                  <a
                    href={selectedFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm transition-all duration-150 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Open in new tab
                  </a>
                ) : null}
              </div>

              {selectedFileUrl ? (
                <iframe
                  src={selectedFileUrl}
                  title="Submission file preview"
                  className="h-[420px] w-full rounded-lg border border-slate-200 bg-white"
                />
              ) : (
                <div className="flex h-[160px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white">
                  <p className="text-sm text-slate-600">Select a submission file to preview it here.</p>
                </div>
              )}
            </section>
          </div>
        ) : (
          <p className="text-sm text-slate-600">Failed to load submissions.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
