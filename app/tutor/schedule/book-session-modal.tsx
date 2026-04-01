'use client';

import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { createSession } from '@/app/actions/sessions';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type StudentOption = {
  id: string;
  student_name: string;
  target_grade: string | null;
};

type BookSessionModalProps = {
  students: StudentOption[];
};

function toIsoFromLocal(dateValue: string, timeValue: string): string | null {
  if (!dateValue || !timeValue) {
    return null;
  }

  const local = new Date(`${dateValue}T${timeValue}`);
  if (Number.isNaN(local.getTime())) {
    return null;
  }

  return local.toISOString();
}

export function BookSessionModal({ students }: BookSessionModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [clientId, setClientId] = useState(students[0]?.id ?? '');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isRecurring, setIsRecurring] = useState(true);

  const hasStudents = students.length > 0;

  const selectedStudent = useMemo(
    () => students.find((item) => item.id === clientId) ?? null,
    [clientId, students]
  );

  function resetForm() {
    setClientId(students[0]?.id ?? '');
    setDate('');
    setStartTime('16:00');
    setEndTime('17:00');
    setIsRecurring(true);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button disabled={!hasStudents}>Book Session</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-lg font-semibold text-slate-900 sm:text-xl">Book Session</DialogTitle>

        {!hasStudents ? (
          <p className="mt-3 text-sm text-slate-600">Add a student first before booking sessions.</p>
        ) : (
          <form
            className="mt-4 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();

              if (!clientId) {
                toast.error('Please select a student.');
                return;
              }

              const startIso = toIsoFromLocal(date, startTime);
              const endIso = toIsoFromLocal(date, endTime);

              if (!startIso || !endIso) {
                toast.error('Please select a valid date and time range.');
                return;
              }

              startTransition(async () => {
                const result = await createSession({
                  client_id: clientId,
                  start_time: startIso,
                  end_time: endIso,
                  is_recurring: isRecurring,
                });

                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }

                toast.success(
                  isRecurring
                    ? `Booked recurring block (${result.created} sessions over 13 weeks).`
                    : 'Session booked successfully.'
                );
                setOpen(false);
                resetForm();
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <select
                id="student"
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
              >
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.student_name}
                    {student.target_grade ? ` - Target ${student.target_grade}` : ''}
                  </option>
                ))}
              </select>
              {selectedStudent?.target_grade ? (
                <p className="text-xs text-slate-500">Target grade: {selectedStudent.target_grade}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="session_date">Date</Label>
              <Input
                id="session_date"
                type="date"
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time</Label>
                <Input
                  id="start_time"
                  type="time"
                  required
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time</Label>
                <Input
                  id="end_time"
                  type="time"
                  required
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(event) => setIsRecurring(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-sm font-medium text-slate-800">Make this a weekly recurring session</p>
                <p className="text-xs text-slate-500">Creates 13 sessions total (initial + 12 weekly).</p>
              </div>
            </label>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
