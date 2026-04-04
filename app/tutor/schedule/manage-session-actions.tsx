'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { cancelSession, rescheduleSession } from '@/app/actions/sessions';
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
import { DangerConfirmDialog } from '@/components/ui/danger-confirm-dialog';

type ManageSessionActionsProps = {
  sessionId: string;
  studentName: string;
  startTime: string;
  endTime: string;
};

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function toDateInputValue(isoValue: string): string {
  const date = new Date(isoValue);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toTimeInputValue(isoValue: string): string {
  const date = new Date(isoValue);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

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

export function ManageSessionActions({
  sessionId,
  studentName,
  startTime,
  endTime,
}: ManageSessionActionsProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState(() => toDateInputValue(startTime));
  const [startTimeValue, setStartTimeValue] = useState(() => toTimeInputValue(startTime));
  const [endTimeValue, setEndTimeValue] = useState(() => toTimeInputValue(endTime));

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setDate(toDateInputValue(startTime));
            setStartTimeValue(toTimeInputValue(startTime));
            setEndTimeValue(toTimeInputValue(endTime));
          }
        }}
      >
        <DialogTrigger asChild>
          <Button type="button" variant="outline" className="h-8 px-3 text-xs">
            Reschedule
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogTitle className="text-lg font-semibold text-slate-900">Reschedule Lesson</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-slate-600">
            Update the date and time for {studentName}. We will prevent times that clash with your other lessons.
          </DialogDescription>

          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();

              const startIso = toIsoFromLocal(date, startTimeValue);
              const endIso = toIsoFromLocal(date, endTimeValue);

              if (!startIso || !endIso) {
                toast.error('Please enter a valid date and time range.');
                return;
              }

              startTransition(async () => {
                const result = await rescheduleSession({
                  session_id: sessionId,
                  start_time: startIso,
                  end_time: endIso,
                });

                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }

                toast.success('Lesson rescheduled successfully.');
                setOpen(false);
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor={`reschedule-date-${sessionId}`}>Date</Label>
              <Input
                id={`reschedule-date-${sessionId}`}
                type="date"
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`reschedule-start-${sessionId}`}>Start Time</Label>
                <Input
                  id={`reschedule-start-${sessionId}`}
                  type="time"
                  required
                  value={startTimeValue}
                  onChange={(event) => setStartTimeValue(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`reschedule-end-${sessionId}`}>End Time</Label>
                <Input
                  id={`reschedule-end-${sessionId}`}
                  type="time"
                  required
                  value={endTimeValue}
                  onChange={(event) => setEndTimeValue(event.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Saving...' : 'Confirm Reschedule'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <DangerConfirmDialog
        triggerLabel="Cancel Lesson"
        title="Cancel Lesson"
        description={`Cancel this lesson for ${studentName}. It will be removed from scheduled lesson lists.`}
        keyword="CANCEL"
        confirmLabel="Yes, Cancel Lesson"
        pendingLabel="Cancelling..."
        triggerClassName="h-8 px-3 text-xs"
        onConfirm={async () => {
          const result = await cancelSession(sessionId);
          if (!result.ok) {
            toast.error(result.error);
            return false;
          }

          toast.success('Lesson cancelled.');
          return true;
        }}
      />
    </div>
  );
}
