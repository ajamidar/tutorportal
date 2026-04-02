import { getClientAssignments } from '@/app/actions/portal';
import { Badge } from '@/components/ui/badge';

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
  const assignments = await getClientAssignments();

  return (
    <main className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Homework</p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          Assignments
        </h1>

        {assignments.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            No assignments yet. If you expect to see work here, ask your tutor to publish your first task.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {assignments.map((assignment) => {
              const status = getStatusPresentation(assignment.status);

              return (
                <article
                  key={assignment.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-sm font-semibold text-slate-900 sm:text-base">{assignment.title}</h2>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>

                  {assignment.description ? (
                    <p className="mt-2 text-sm text-slate-600">{assignment.description}</p>
                  ) : null}

                  <p className="mt-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Due {formatDate(assignment.due_date)}
                  </p>

                  <a
                    href={assignment.resource_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex h-9 items-center justify-center rounded-xl border border-blue-200 bg-white px-3 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                  >
                    Open Resource
                  </a>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}