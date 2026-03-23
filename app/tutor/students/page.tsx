import { getTutorStudents } from '@/app/actions/students';
import { AddStudentModal } from './add-student-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DeleteStudentButton } from './delete-student-button';

export default async function TutorStudentsPage() {
  const students = await getTutorStudents();

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

      {students.length === 0 ? (
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
          {students.map((student) => (
            <Card key={student.id} className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{student.student_name}</CardTitle>
                    <p className="mt-1 text-sm font-medium text-blue-700">
                      {student.subject} · {student.level === 'a_level' ? 'A-Level' : 'GCSE'}
                    </p>
                  </div>
                  <DeleteStudentButton
                    id={student.id}
                    label={`${student.student_name} - ${student.subject}`}
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
                    <dt className="text-slate-500">Exam Board</dt>
                    <dd className="font-medium text-slate-900">{student.exam_board}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Current Grade</dt>
                    <dd className="font-medium text-slate-900">
                      {student.current_working_grade ?? '-'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Target Grade</dt>
                    <dd className="font-medium text-slate-900">{student.target_grade ?? '-'}</dd>
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
