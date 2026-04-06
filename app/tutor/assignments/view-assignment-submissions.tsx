'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MarkSubmissionModal } from './mark-submission-modal';

type Submission = {
  id: string;
  student_name: string;
  submitted_date: string | null;
  submission_status: 'pending' | 'submitted' | 'marked';
  marks: number | null;
  submitted_file_url: string | null;
};

type ViewAssignmentSubmissionsProps = {
  submissions: Submission[];
  selectedFileUrl: string | null;
  onSelectFile: (url: string | null) => void;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getSubmissionStatusPresentation(status: 'pending' | 'submitted' | 'marked') {
  if (status === 'marked') {
    return { label: 'Marked', variant: 'success' as const };
  }

  if (status === 'submitted') {
    return { label: 'Submitted', variant: 'default' as const };
  }

  return { label: 'Pending', variant: 'warning' as const };
}

export function ViewAssignmentSubmissions({
  submissions,
  selectedFileUrl,
  onSelectFile,
}: ViewAssignmentSubmissionsProps) {
  if (submissions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <p className="text-sm font-medium text-slate-700">No submissions yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
              Student
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
              Submitted
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
              Marks
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {submissions.map((submission) => {
            const status = getSubmissionStatusPresentation(submission.submission_status);

            return (
              <tr key={submission.id}>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{submission.student_name}</td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {submission.submitted_date ? formatDate(submission.submitted_date) : '—'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {submission.marks !== null ? `${submission.marks}` : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {submission.submitted_file_url && (
                      <Button
                        type="button"
                        variant={selectedFileUrl === submission.submitted_file_url ? 'default' : 'outline'}
                        onClick={() => onSelectFile(submission.submitted_file_url)}
                        className="h-8 px-3 text-xs"
                      >
                        View
                      </Button>
                    )}
                    {submission.submission_status !== 'pending' && (
                      <MarkSubmissionModal
                        submissionId={submission.id}
                        studentName={submission.student_name}
                        hasMarked={submission.submission_status === 'marked'}
                      />
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
