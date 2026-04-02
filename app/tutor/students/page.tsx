import { getTutorStudents } from '@/app/actions/students';
import { AddStudentModal } from './add-student-modal';
import { StudentsRoster } from './students-roster';

type GroupedStudent = {
  client_id: string;
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
};

export default async function TutorStudentsPage() {
  const students = await getTutorStudents();
  const groupedMap = new Map<string, GroupedStudent>();

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
        client_id: student.client_id,
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

      <StudentsRoster students={groupedStudents} />
    </main>
  );
}
