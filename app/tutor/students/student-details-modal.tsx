'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DeleteStudentButton } from './delete-student-button';

type SubjectEntry = {
  id: string;
  subject: string;
  exam_board: string;
  current_working_grade: string | null;
  target_grade: string | null;
};

type StudentDetailsModalProps = {
  clientId: string;
  studentName: string;
  level: 'gcse' | 'a_level';
  clientEmail: string;
  clientFullName: string | null;
  subjects: SubjectEntry[];
};

function gradeDisplay(value: string | number | null) {
  const normalized = String(value ?? '').trim();
  return normalized && normalized.length > 0 ? normalized : 'Not set';
}

export function StudentDetailsModal({
  clientId,
  studentName,
  level,
  clientEmail,
  clientFullName,
  subjects,
}: StudentDetailsModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className='bg-green-200 text-black border-green-400 shadow-sm shadow-green-500 hover:text-slate-700 hover:bg-green-300'>View Details</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogTitle className="text-lg font-semibold text-slate-900 sm:text-xl">
          {studentName}
        </DialogTitle>
        <DialogDescription className="sr-only">
          View the student profile, subject entries, grades, and related roster actions.
        </DialogDescription>

        <div className="mt-3 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-900">
              {level === 'a_level' ? 'A-Level' : 'GCSE'}
            </p>
            <p className="mt-1 text-sm text-slate-600">Client Email: {clientEmail}</p>
            {clientFullName ? <p className="text-sm text-slate-600">Client Name: {clientFullName}</p> : null}
          </div>

          <div className="space-y-3">
            {subjects.map((entry) => (
              <article key={entry.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{entry.subject}</p>
                    <p className="mt-1 text-sm text-slate-600">Exam Board: {entry.exam_board}</p>
                  </div>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <p className="text-slate-600">Current: {gradeDisplay(entry.current_working_grade)}</p>
                  <p className="text-slate-600">Target: {gradeDisplay(entry.target_grade)}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="flex justify-end border-t border-slate-200 pt-4">
            <DeleteStudentButton
              clientId={clientId}
              studentName={studentName}
              level={level}
              label={`${studentName} (${level === 'a_level' ? 'A-Level' : 'GCSE'})`}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
