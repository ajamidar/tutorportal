import { getTutorStudents } from '@/app/actions/students';
import { AddStudentModal } from './add-student-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentDetailsModal } from './student-details-modal';

export default async function TutorStudentsPage() {
  const students = await getTutorStudents();
  const groupedMap = new Map<string, {
    student_name: string;
    level: 'gcse' | 'a_level';
    client: { email: string; full_name: string | null };
    subjects: Array<{
      id: string;
      subject: string;
      exam_board: string;
      current_working_grade: string | null;
      target_grade: string | null;
    }>;
  }>();

  for (const student of students) {
    const currentWorkingGrade =
      (student.current_working_grade as string | null | undefined) ??
      ((student as unknown as { currentWorkingGrade?: string | null }).currentWorkingGrade ?? null);
    const targetGrade =
      (student.target_grade as string | null | undefined) ??
      ((student as unknown as { targetGrade?: string | null }).targetGrade ?? null);

    const key = `${student.client_id}:${student.student_name}:${student.level}`;
    const current = groupedMap.get(key);

    if (!current) {
      groupedMap.set(key, {
        student_name: student.student_name,
        level: student.level,
        client: student.client,
        subjects: [
          {
            id: student.id,
            subject: student.subject,
            exam_board: student.exam_board,
            current_working_grade: currentWorkingGrade,
            target_grade: targetGrade,
          },
        ],
      });
      continue;
    }

    current.subjects.push({
      id: student.id,
      subject: student.subject,
      exam_board: student.exam_board,
      current_working_grade: currentWorkingGrade,
      target_grade: targetGrade,
    });
  }

  const groupedStudents = Array.from(groupedMap.values()).sort((a, b) =>
    a.student_name.localeCompare(b.student_name)
  );

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Roster</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900 sm:text-3xl">My Students</h2>
          <p className="text-sm text-slate-600">Manage your student roster and target grades.</p>
        </div>
        <AddStudentModal />
      </section>

      {groupedStudents.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No students yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">You haven&apos;t added any students yet.</p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {groupedStudents.map((student) => (
            <Card key={`${student.client.email}:${student.student_name}:${student.level}`} className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{student.student_name}</CardTitle>
                    <p className="mt-1 text-sm font-medium text-blue-700">
                      {student.level === 'a_level' ? 'A-Level' : 'GCSE'} · {student.subjects.length}{' '}
                      {student.subjects.length === 1 ? 'Subject' : 'Subjects'}
                    </p>
                  </div>
                  <StudentDetailsModal
                    studentName={student.student_name}
                    level={student.level}
                    clientEmail={student.client.email}
                    clientFullName={student.client.full_name}
                    subjects={student.subjects}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Client Email</dt>
                    <dd className="font-medium text-slate-900">{student.client.email}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Client Name</dt>
                    <dd className="font-medium text-slate-900">{student.client.full_name ?? '-'}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Subjects</dt>
                    <dd className="font-medium text-slate-900">
                      {student.subjects.map((item) => item.subject).join(', ')}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Details</dt>
                    <dd className="font-medium text-blue-700">Open View Details</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}
