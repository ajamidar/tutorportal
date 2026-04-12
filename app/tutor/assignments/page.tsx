import { getTutorAssignments } from '@/app/actions/assignments';
import { getTutorStudents } from '@/app/actions/students';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateAssignmentModal } from './create-assignment-modal';
import { AssignmentsTable } from './assignments-table';

export default async function TutorAssignmentsPage() {
  const [assignments, students] = await Promise.all([getTutorAssignments(), getTutorStudents()]);

  const groupedClientsMap = new Map<
    string,
    {
      clientKey: string;
      studentName: string;
      clientEmail: string;
      subjects: Array<{ clientProfileId: string; subject: string }>;
    }
  >();

  for (const student of students) {
    const key = `${student.client_id}:${student.student_name}:${student.level}`;
    const existing = groupedClientsMap.get(key);

    if (existing) {
      existing.subjects.push({
        clientProfileId: student.id,
        subject: student.subject,
      });
      continue;
    }

    groupedClientsMap.set(key, {
      clientKey: key,
      studentName: student.student_name,
      clientEmail: student.client.email,
      subjects: [
        {
          clientProfileId: student.id,
          subject: student.subject,
        },
      ],
    });
  }

  const assignmentClients = Array.from(groupedClientsMap.values())
    .map((client) => ({
      ...client,
      subjects: client.subjects.sort((a, b) => a.subject.localeCompare(b.subject)),
    }))
    .sort((a, b) => a.studentName.localeCompare(b.studentName));

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
            <AssignmentsTable assignments={assignments} />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
