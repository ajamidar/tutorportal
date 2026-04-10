'use client';

import { useMemo, useState } from 'react';
import type { ClientAssignmentWithSubmission } from '@/app/actions/assignments';
import { Badge } from '@/components/ui/badge';
import { SubmitAssignmentModal } from './submit-assignment-modal';
import { ViewFeedbackModal } from './view-feedback-modal';
import { ArrowUpDown, ChevronDown, ChevronUp, FilterIcon } from 'lucide-react';

type AssignmentStatusFilter = 'all' | 'pending' | 'submitted' | 'marked';
type DueDateSort = 'earliest' | 'latest';

type PortalAssignmentsListProps = {
  assignments: ClientAssignmentWithSubmission[];
};

const FILTERS: Array<{ value: AssignmentStatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'marked', label: 'Marked' },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusPresentation(status: 'pending' | 'submitted' | 'marked') {
  if (status === 'marked') {
    return { label: 'Marked', variant: 'success' as const };
  }

  if (status === 'pending') {
    return { label: 'Pending', variant: 'warning' as const };
  }

  return { label: 'Submitted', variant: 'default' as const };
}

function getSubmissionStatus(assignment: ClientAssignmentWithSubmission) {
  return assignment.submission?.submission_status ?? 'pending';
}

export function PortalAssignmentsList({ assignments }: PortalAssignmentsListProps) {
  const [statusFilter, setStatusFilter] = useState<AssignmentStatusFilter>('all');
  const [dueDateSort, setDueDateSort] = useState<DueDateSort>('earliest');
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  const assignmentsByStatus = useMemo(() => {
    return assignments.reduce(
      (acc, assignment) => {
        const status = getSubmissionStatus(assignment);
        acc[status] += 1;
        return acc;
      },
      { pending: 0, submitted: 0, marked: 0 }
    );
  }, [assignments]);

  const filteredAssignments = useMemo(() => {
    if (statusFilter === 'all') {
      return assignments;
    }

    return assignments.filter((assignment) => getSubmissionStatus(assignment) === statusFilter);
  }, [assignments, statusFilter]);

  const sortedAssignments = useMemo(() => {
    const sorted = [...filteredAssignments].sort((a, b) => {
      const aTime = new Date(a.due_date).getTime();
      const bTime = new Date(b.due_date).getTime();
      return dueDateSort === 'earliest' ? aTime - bTime : bTime - aTime;
    });

    return sorted;
  }, [filteredAssignments, dueDateSort]);

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-2xl border border-slate-300 bg-white/70 p-2">
        <div className="flex items-center justify-between gap-2 px-2 pb-1">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
            <FilterIcon className="mr-1 mb-1 inline-block h-4 w-4" />Filter and Sort
          </p>
          <button
            type="button"
            onClick={() => setIsControlsOpen((prev) => !prev)}
            aria-expanded={isControlsOpen}
            aria-controls="homework-controls-panel"
            className="inline-flex items-center gap-1 rounded-full border border-slate-600 shadow-sm shadow-slate-700 bg-slate-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-opacity-75"
          >
            {isControlsOpen ? 'Hide' : 'Show'}
            {isControlsOpen ? <ChevronUp className="h-3.5 w-3.5 text-red-300" /> : <ChevronDown className="h-3.5 w-3.5 text-green-300" />}
          </button>
        </div>

        {isControlsOpen && (
          <div id="homework-controls-panel" className="space-y-2 border-t border-slate-200 px-2 pt-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
              <FilterIcon className="mr-1 mb-1 inline-block h-4 w-4" />Filter by Status
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {FILTERS.map((filter) => {
                const count =
                  filter.value === 'all'
                    ? assignments.length
                    : assignmentsByStatus[filter.value as keyof typeof assignmentsByStatus];
                const isActive = statusFilter === filter.value;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setStatusFilter(filter.value)}
                    className={`inline-flex min-w-fit items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? 'border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-300'
                        : 'border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700'
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-1">
              <p className="pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
                <ArrowUpDown className="mr-1 mb-1 inline-block h-4 w-4" />Sort
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setDueDateSort('earliest')}
                  className={`inline-flex min-w-fit items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    dueDateSort === 'earliest'
                      ? 'border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-300'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700'
                  }`}
                >
                  Earliest first
                </button>
                <button
                  type="button"
                  onClick={() => setDueDateSort('latest')}
                  className={`inline-flex min-w-fit items-center whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    dueDateSort === 'latest'
                      ? 'border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-300'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700'
                  }`}
                >
                  Latest first
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {sortedAssignments.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          No {statusFilter === 'all' ? '' : statusFilter + ' '}assignments right now.
        </p>
      ) : (
        sortedAssignments.map((assignment) => {
          const submission = assignment.submission;
          const submissionStatus = getSubmissionStatus(assignment);
          const status = getStatusPresentation(submissionStatus);

          return (
            <article
              key={assignment.id}
              className="rounded-2xl border border-slate-300 bg-slate-50 p-4 shadow-sm shadow-slate-400"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 sm:text-base">{assignment.title}</h2>
                  {assignment.subject ? (
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Subject: {assignment.subject}
                    </p>
                  ) : null}
                </div>
                <Badge
                  className={`rounded-full ${
                    status.variant === 'success'
                      ? 'bg-green-100 text-green-800'
                      : status.variant === 'warning'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {status.label}
                </Badge>
              </div>

              {assignment.description ? (
                <p className="mt-2 text-sm text-slate-600">{assignment.description}</p>
              ) : null}

              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-red-500">
                Due {formatDate(assignment.due_date)}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={assignment.resource_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-blue-200 bg-blue-100 px-3 text-sm font-medium text-blue-700 shadow-sm shadow-blue-300 transition hover:bg-blue-200"
                >
                  Open Resource
                </a>
                <SubmitAssignmentModal
                  assignmentId={assignment.id}
                  hasSubmitted={
                    submission?.submission_status === 'submitted' ||
                    submission?.submission_status === 'marked'
                  }
                />
                {submission?.submission_status === 'marked' && (
                  <ViewFeedbackModal
                    marks={submission.marks}
                    feedbackText={submission.feedback_text}
                    feedbackPdfPath={submission.feedback_pdf_path}
                    feedbackPdfUrl={submission.feedback_pdf_url}
                    markedDate={submission.marked_date}
                  />
                )}
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}
