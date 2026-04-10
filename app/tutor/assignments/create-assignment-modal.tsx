'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { createAssignment } from '@/app/actions/assignments';
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

type ClientOption = {
  clientKey: string;
  studentName: string;
  clientEmail: string;
  subjects: Array<{
    clientProfileId: string;
    subject: string;
  }>;
};

type CreateAssignmentModalProps = {
  clients: ClientOption[];
};

export function CreateAssignmentModal({ clients }: CreateAssignmentModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const hasClients = clients.length > 0;
  const defaultClientKey = clients[0]?.clientKey ?? '';
  const defaultClientProfileId = clients[0]?.subjects[0]?.clientProfileId ?? '';

  const [selectedClientKey, setSelectedClientKey] = useState(defaultClientKey);
  const [selectedClientProfileId, setSelectedClientProfileId] = useState(defaultClientProfileId);

  const selectedClient = useMemo(
    () => clients.find((client) => client.clientKey === selectedClientKey) ?? null,
    [clients, selectedClientKey]
  );

  const subjectOptions = selectedClient?.subjects ?? [];

  function resetSelection() {
    setSelectedClientKey(defaultClientKey);
    setSelectedClientProfileId(defaultClientProfileId);
  }

  useEffect(() => {
    if (!selectedClient) {
      setSelectedClientProfileId('');
      return;
    }

    const hasSelectedSubject = selectedClient.subjects.some(
      (subject) => subject.clientProfileId === selectedClientProfileId
    );

    if (!hasSelectedSubject) {
      setSelectedClientProfileId(selectedClient.subjects[0]?.clientProfileId ?? '');
    }
  }, [selectedClient, selectedClientProfileId]);

  function resetForm(form?: HTMLFormElement) {
    if (form) {
      form.reset();
    }

    resetSelection();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          resetSelection();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button disabled={!hasClients}>New Assignment</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogTitle className="text-lg font-semibold text-slate-900 sm:text-xl">New Assignment</DialogTitle>
        <DialogDescription className="sr-only">
          Create an assignment with due date and upload the assignment file.
        </DialogDescription>

        {!hasClients ? (
          <p className="mt-3 text-sm text-slate-600">Add a student first before creating assignments.</p>
        ) : (
          <form
            className="mt-4 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const formData = new FormData(form);

              if (!selectedClientProfileId) {
                toast.error('Please select a subject.');
                return;
              }

              formData.set('client_id', selectedClientProfileId);

              startTransition(async () => {
                const result = await createAssignment(formData);

                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }

                toast.success('Assignment created and file uploaded.');
                resetForm(form);
                setOpen(false);
              });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="assignment_client">Student</Label>
              <select
                id="assignment_client"
                required
                value={selectedClientKey}
                onChange={(event) => {
                  const nextClientKey = event.target.value;
                  setSelectedClientKey(nextClientKey);

                  const nextClient = clients.find((client) => client.clientKey === nextClientKey) ?? null;
                  setSelectedClientProfileId(nextClient?.subjects[0]?.clientProfileId ?? '');
                }}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
              >
                {clients.map((client) => (
                  <option key={client.clientKey} value={client.clientKey}>
                    {client.studentName} ({client.clientEmail})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment_subject">Subject</Label>
              <select
                id="assignment_subject"
                name="client_id"
                required
                value={selectedClientProfileId}
                onChange={(event) => setSelectedClientProfileId(event.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
              >
                {subjectOptions.map((subject) => (
                  <option key={subject.clientProfileId} value={subject.clientProfileId}>
                    {subject.subject}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">Only subjects this student is enrolled for are shown.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment_title">Title</Label>
              <Input id="assignment_title" name="title" required placeholder="Paper 1 Algebra Practice" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment_description">Description</Label>
              <textarea
                id="assignment_description"
                name="description"
                rows={4}
                placeholder="Complete Questions 1-10 and show full working."
                className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment_due_date">Due Date</Label>
              <Input id="assignment_due_date" name="due_date" type="date" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment_file">File</Label>
              <Input
                id="assignment_file"
                name="file"
                type="file"
                required
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              />
              <p className="text-xs text-slate-500">Accepted: PDF, DOC, DOCX, PNG, JPG.</p>
            </div>

            <Button type="submit" className="w-full" disabled={isPending || !selectedClientProfileId}>
              {isPending ? 'Uploading...' : 'Create Assignment'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
