import { getTutorAssignments } from '@/app/actions/assignments';
import { getTutorStudents } from '@/app/actions/students';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateAssignmentModal } from './create-assignment-modal';
import { ViewSubmissionsModal } from './view-submissions-modal';

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

export default async function TutorAssignmentsPage() {
  const [assignments, students] = await Promise.all([getTutorAssignments(), getTutorStudents()]);

  const groupedClientsMap = new Map<string, { clientProfileId: string; studentName: string; clientEmail: string }>();
  for (const student of students) {
    const key = `${student.client_id}:${student.student_name}:${student.level}`;
    if (!groupedClientsMap.has(key)) {
      groupedClientsMap.set(key, {
        clientProfileId: student.id,
        studentName: student.student_name,
        clientEmail: student.client.email,
      });
    }
  }

  const assignmentClients = Array.from(groupedClientsMap.values()).sort((a, b) =>
    a.studentName.localeCompare(b.studentName)
  );

  return (
    <main className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Academics</p>
            <CardTitle>Assignments & Past Papers</CardTitle>
          </div>
          <CreateAssignmentModal clients={assignmentClients} />
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <p className="text-sm font-medium text-slate-700">No assignments created yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {assignments.map((assignment) => {
                    const status = getStatusPresentation(assignment.status);

                    return (
                      <tr key={assignment.id}>
                        <td className="px-4 py-3 text-sm text-slate-900">
                          <p className="font-medium">{assignment.title}</p>
                          {assignment.description ? (
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{assignment.description}</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {assignment.student?.student_name ?? 'Unknown student'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{formatDate(assignment.due_date)}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <a
                              href={assignment.resource_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-150 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                            >
                              Download File
                            </a>
                            <ViewSubmissionsModal assignmentId={assignment.id} assignmentTitle={assignment.title} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
