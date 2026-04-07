import { getClientAssignmentsWithSubmissions } from '@/app/actions/assignments';
import { PortalAssignmentsList } from './portal-assignments-list';

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
          <PortalAssignmentsList assignments={assignments} />
        )}
      </section>
    </main>
  );
}