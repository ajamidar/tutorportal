import { getClientAssignmentsWithSubmissions } from '@/app/actions/assignments';
import { Badge } from '@/components/ui/badge';
import { SubmitAssignmentModal } from './submit-assignment-modal';
import { ViewFeedbackModal } from './view-feedback-modal';

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

export default async function PortalAssignmentsPage() {
  const assignments = await getClientAssignmentsWithSubmissions();

  return (
    <main className="space-y-4">
      <section className="rounded-3xl border border-slate-300 shadow-md shadow-slate-400 bg-gradient-to-b from-blue-100 via-blue-50 to-blue-100 p-5  sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Homework</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          Assignments
        </h1>

        {assignments.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            No assignments yet. If you expect to see work here, ask your tutor to publish your first task.
          </p>
        ) : (
          <div className="mt-4 space-y-3 ">
            {assignments.map((assignment) => {
              const submission = assignment.submission;
              const submissionStatus = submission?.submission_status || 'pending';
              const status = getStatusPresentation(submissionStatus);

              return (
                <article
                  key={assignment.id}
                  className="rounded-2xl border border-slate-300 shadow-sm shadow-slate-400 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-sm font-semibold text-slate-900 sm:text-base">{assignment.title}</h2>
                    <Badge className={`rounded-full ${status.variant === 'success' ? 'bg-green-100 text-green-800' : status.variant === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
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
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-blue-200 shadow-sm shadow-blue-300 bg-white px-3 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                    >
                      Open Resource
                    </a>
                    <SubmitAssignmentModal
                      assignmentId={assignment.id}
                      hasSubmitted={submission?.submission_status === 'submitted' || submission?.submission_status === 'marked'}
                    />
                    {submission?.submission_status === 'marked' && (
                      <ViewFeedbackModal
                        marks={submission.marks}
                        feedbackText={submission.feedback_text}
                        feedbackPdfUrl={submission.feedback_pdf_url}
                        markedDate={submission.marked_date}
                      />
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}