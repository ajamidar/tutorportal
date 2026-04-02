'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { addClientProfile } from '@/app/actions/students';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const examBoards = ['AQA', 'Edexcel', 'OCR', 'WJEC', 'CIE'];
const subjects = [
  'Mathematics',
  'English Language',
  'English Literature',
  'Biology',
  'Chemistry',
  'Physics',
  'Combined Science',
  'History',
  'Geography',
  'Computer Science',
  'Economics',
  'Business Studies',
  'Psychology',
  'Sociology',
  'French',
  'Spanish',
  'Religious Studies',
];

type SubjectRow = {
  id: string;
  subject: string;
  examBoard: string;
  currentWorkingGrade: string;
  targetGrade: string;
};

export function AddStudentModal() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [subjectRows, setSubjectRows] = useState<SubjectRow[]>([
    {
      id: crypto.randomUUID(),
      subject: 'Mathematics',
      examBoard: 'AQA',
      currentWorkingGrade: '',
      targetGrade: '',
    },
  ]);
  const [expandedSubjectId, setExpandedSubjectId] = useState(subjectRows[0].id);

  function updateRow(id: string, key: keyof Omit<SubjectRow, 'id'>, value: string) {
    setSubjectRows((rows) => rows.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  }

  function addRow() {
    const newRow: SubjectRow = {
      id: crypto.randomUUID(),
      subject: 'Mathematics',
      examBoard: 'AQA',
      currentWorkingGrade: '',
      targetGrade: '',
    };

    setSubjectRows((rows) => [
      ...rows,
      newRow,
    ]);
    setExpandedSubjectId(newRow.id);
  }

  function removeRow(id: string) {
    setSubjectRows((rows) => {
      if (rows.length === 1) return rows;
      const updated = rows.filter((row) => row.id !== id);
      if (expandedSubjectId === id) {
        setExpandedSubjectId(updated[updated.length - 1]?.id ?? '');
      }
      return updated;
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto border-blue-800 shadow-sm shadow-blue-900"><span className='text-lg border-white border rounded-full px-1.5 mr-1'>✚</span>Add Student </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogTitle className="text-lg font-semibold text-slate-900 sm:text-xl">
          Add Student
        </DialogTitle>
        <DialogDescription className="sr-only">
          Add a student profile and one or more subject entries for the selected client.
        </DialogDescription>
        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            startTransition(async () => {
              const result = await addClientProfile({
                email: String(formData.get('email') ?? ''),
                studentName: String(formData.get('student_name') ?? ''),
                level: String(formData.get('level') ?? 'gcse') === 'a_level' ? 'a_level' : 'gcse',
                subjects: subjectRows,
              });

              if (!result.ok) {
                toast.error(result.error);
                return;
              }

              toast.success(`Added ${result.created ?? subjectRows.length} subject entr${subjectRows.length === 1 ? 'y' : 'ies'}.`);
              setOpen(false);
              (event.target as HTMLFormElement).reset();
              const resetRow: SubjectRow = {
                id: crypto.randomUUID(),
                subject: 'Mathematics',
                examBoard: 'AQA',
                currentWorkingGrade: '',
                targetGrade: '',
              };
              setSubjectRows([resetRow]);
              setExpandedSubjectId(resetRow.id);
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Parent/Client Email</Label>
            <Input id="email" name="email" type="email" required placeholder="parent@example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="student_name">Student Name</Label>
            <Input id="student_name" name="student_name" required placeholder="Aisha Khan" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Qualification Level</Label>
            <select
              id="level"
              name="level"
              required
              defaultValue="gcse"
              className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
            >
              <option value="gcse">GCSE</option>
              <option value="a_level">A-Level</option>
            </select>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-3 shadow-sm sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Subjects</Label>
                <p className="text-xs text-slate-500">Add one or more subjects for this student.</p>
              </div>
              <Button type="button" variant="outline" onClick={addRow}>
                Add Subject
              </Button>
            </div>
            <div className="space-y-3">
              {subjectRows.map((row, index) => (
                <div key={row.id} className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSubjectId((current) => (current === row.id ? '' : row.id))
                      }
                      className="flex min-w-0 flex-1 items-center justify-between rounded-lg px-2 py-1 text-left transition hover:bg-slate-50"
                      aria-expanded={expandedSubjectId === row.id}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">Subject {index + 1}</p>
                        <p className="truncate text-xs text-slate-500">
                          {row.subject} - {row.examBoard}
                          {row.targetGrade ? ` - Target ${row.targetGrade}` : ''}
                        </p>
                      </div>
                      <span className="ml-2 text-xs font-medium text-blue-700">
                        {expandedSubjectId === row.id ? 'Collapse' : 'Expand'}
                      </span>
                    </button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeRow(row.id)}
                      disabled={subjectRows.length === 1}
                    >
                      Remove
                    </Button>
                  </div>

                  {expandedSubjectId === row.id ? (
                    <div className="mt-3 space-y-3 border-t border-slate-100 pt-3">
                      <div className="space-y-2">
                        <Label>Subject</Label>
                        <select
                          value={row.subject}
                          onChange={(event) => updateRow(row.id, 'subject', event.target.value)}
                          className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
                        >
                          {subjects.map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Exam Board</Label>
                        <select
                          value={row.examBoard}
                          onChange={(event) => updateRow(row.id, 'examBoard', event.target.value)}
                          className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
                        >
                          {examBoards.map((examBoard) => (
                            <option key={examBoard} value={examBoard}>
                              {examBoard}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Current Working Grade</Label>
                          <Input
                            value={row.currentWorkingGrade}
                            onChange={(event) =>
                              updateRow(row.id, 'currentWorkingGrade', event.target.value)
                            }
                            placeholder="5"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Target Grade</Label>
                          <Input
                            value={row.targetGrade}
                            onChange={(event) => updateRow(row.id, 'targetGrade', event.target.value)}
                            placeholder="7"
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Adding...' : 'Save Student'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
