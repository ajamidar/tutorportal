'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { StudentDetailsModal } from './student-details-modal';

type SubjectEntry = {
  id: string;
  subject: string;
  exam_board: string;
  current_working_grade: string | null;
  target_grade: string | null;
};

type GroupedStudent = {
  student_name: string;
  level: 'gcse' | 'a_level';
  client: { email: string; full_name: string | null };
  subjects: SubjectEntry[];
};

type StudentsRosterProps = {
  students: GroupedStudent[];
};

export function StudentsRoster({ students }: StudentsRosterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'gcse' | 'a_level'>('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [examBoardFilter, setExamBoardFilter] = useState('all');

  const subjectOptions = useMemo(() => {
    const uniqueSubjects = new Set<string>();

    for (const student of students) {
      for (const item of student.subjects) {
        uniqueSubjects.add(item.subject);
      }
    }

    return Array.from(uniqueSubjects).sort((a, b) => a.localeCompare(b));
  }, [students]);

  const examBoardOptions = useMemo(() => {
    const uniqueExamBoards = new Set<string>();

    for (const student of students) {
      for (const item of student.subjects) {
        uniqueExamBoards.add(item.exam_board);
      }
    }

    return Array.from(uniqueExamBoards).sort((a, b) => a.localeCompare(b));
  }, [students]);

  const filteredStudents = useMemo(() => {
    const normalizedName = searchQuery.trim().toLowerCase();

    return students.filter((student) => {
      const matchesName =
        normalizedName.length === 0 || student.student_name.toLowerCase().includes(normalizedName);
      const matchesLevel = levelFilter === 'all' || student.level === levelFilter;
      const matchesSubject =
        subjectFilter === 'all' || student.subjects.some((item) => item.subject === subjectFilter);
      const matchesExamBoard =
        examBoardFilter === 'all' ||
        student.subjects.some((item) => item.exam_board === examBoardFilter);

      return matchesName && matchesLevel && matchesSubject && matchesExamBoard;
    });
  }, [students, searchQuery, levelFilter, subjectFilter, examBoardFilter]);

  if (students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No students yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">You haven&apos;t added any students yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-4 ">
      <Card className="border-slate-300 shadow-sm shadow-slate-400 ">
        <CardHeader className="space-y-2 " >
          <CardTitle className="text-base text-slate-900 sm:text-lg">Search &amp; Filter 🔍︎</CardTitle>
          <p className="text-sm text-slate-600">
            Showing {filteredStudents.length} of {students.length} students
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by student name"
              aria-label="Search students by name"
            />

            <select
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value as 'all' | 'gcse' | 'a_level')}
              aria-label="Filter by study level"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
            >
              <option value="all">All levels</option>
              <option value="gcse">GCSE</option>
              <option value="a_level">A-Level</option>
            </select>

            <select
              value={subjectFilter}
              onChange={(event) => setSubjectFilter(event.target.value)}
              aria-label="Filter by subject"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
            >
              <option value="all">All subjects</option>
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>

            <select
              value={examBoardFilter}
              onChange={(event) => setExamBoardFilter(event.target.value)}
              aria-label="Filter by exam board"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
            >
              <option value="all">All exam boards</option>
              {examBoardOptions.map((examBoard) => (
                <option key={examBoard} value={examBoard}>
                  {examBoard}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {filteredStudents.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No matching students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Try adjusting your search or filters to find a student.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredStudents.map((student) => (
            <Card
              key={`${student.client.email}:${student.student_name}:${student.level}`}
              className="h-full border-slate-300 shadow-sm shadow-slate-400"
            >
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
                </dl>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </section>
  );
}
