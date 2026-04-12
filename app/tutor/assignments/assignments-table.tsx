'use client';

import { useMemo, useState } from 'react';
import type { TutorAssignment } from '@/app/actions/assignments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeleteAssignmentButton, ViewSubmissionsModal } from './view-submissions-modal';

type AssignmentsTableProps = {
  assignments: TutorAssignment[];
};

type AssignmentStatusFilter = 'all' | 'pending' | 'submitted' | 'marked';
type AssignmentSortOption = 'due-date-asc' | 'due-date-desc' | 'student-asc' | 'student-desc';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusPresentation(status: 'pending' | 'submitted' | 'marked') {
  if (status === 'marked') {
    return { label: 'Marked', variant: 'success' as const };
  }

  if (status === 'pending') {
    return { label: 'Pending', variant: 'warning' as const };
  }

  return { label: 'Submitted', variant: 'default' as const };
}

export function AssignmentsTable({ assignments }: AssignmentsTableProps) {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [studentQuery, setStudentQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssignmentStatusFilter>('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sortOption, setSortOption] = useState<AssignmentSortOption>('due-date-asc');

  const subjectOptions = useMemo(() => {
    const subjects = new Set<string>();

    for (const assignment of assignments) {
      if (assignment.student?.subject) {
        subjects.add(assignment.student.subject);
      }
    }

    return Array.from(subjects).sort((a, b) => a.localeCompare(b));
  }, [assignments]);

  const filteredAssignments = useMemo(() => {
    const normalizedQuery = studentQuery.trim().toLowerCase();

    const filtered = assignments.filter((assignment) => {
      const studentName = assignment.student?.student_name ?? '';
      const assignmentSubject = assignment.student?.subject ?? 'Unknown';

      const matchesStudentName = !normalizedQuery || studentName.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
      const matchesSubject = subjectFilter === 'all' || assignmentSubject === subjectFilter;

      return matchesStudentName && matchesStatus && matchesSubject;
    });

    filtered.sort((a, b) => {
      if (sortOption === 'due-date-asc') {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }

      if (sortOption === 'due-date-desc') {
        return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
      }

      const studentA = a.student?.student_name ?? '';
      const studentB = b.student?.student_name ?? '';

      if (sortOption === 'student-desc') {
        return studentB.localeCompare(studentA);
      }

      return studentA.localeCompare(studentB);
    });

    return filtered;
  }, [assignments, sortOption, statusFilter, studentQuery, subjectFilter]);

  function resetFilters() {
    setStudentQuery('');
    setStatusFilter('all');
    setSubjectFilter('all');
    setSortOption('due-date-asc');
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">Sort & Filters</p>
            {!isFilterPanelOpen ? (
              <p className="text-[11px] text-slate-500">
                {filteredAssignments.length}/{assignments.length}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsFilterPanelOpen((previous) => !previous)}
            className="h-7 px-2 text-[11px]"
            aria-expanded={isFilterPanelOpen}
            aria-label={isFilterPanelOpen ? 'Collapse sort and filter panel' : 'Expand sort and filter panel'}
          >
            {isFilterPanelOpen ? 'Hide panel' : 'Show panel'}
          </Button>
        </div>

        {isFilterPanelOpen ? (
          <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              value={studentQuery}
              onChange={(event) => setStudentQuery(event.target.value)}
              placeholder="Search by student name"
              aria-label="Search assignments by student name"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as AssignmentStatusFilter)}
              aria-label="Filter assignments by status"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm ring-offset-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="marked">Marked</option>
            </select>

            <select
              value={subjectFilter}
              onChange={(event) => setSubjectFilter(event.target.value)}
              aria-label="Filter assignments by subject"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm ring-offset-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
            >
              <option value="all">All subjects</option>
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>

            <select
              value={sortOption}
              onChange={(event) => setSortOption(event.target.value as AssignmentSortOption)}
              aria-label="Sort assignments"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm ring-offset-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
            >
              <option value="due-date-asc">Due date: soonest first</option>
              <option value="due-date-desc">Due date: latest first</option>
              <option value="student-asc">Student: A-Z</option>
              <option value="student-desc">Student: Z-A</option>
            </select>
          </div>
        ) : null}

        {isFilterPanelOpen ? (
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Showing {filteredAssignments.length} of {assignments.length} assignment(s)
            </p>
            <Button type="button" variant="outline" onClick={resetFilters} className="h-8 px-3 text-xs sm:w-auto">
              Reset filters
            </Button>
          </div>
        ) : null}
      </div>

      {filteredAssignments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <p className="text-sm font-medium text-slate-700">No assignments match the selected filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                  Due Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredAssignments.map((assignment) => {
                const status = getStatusPresentation(assignment.status);

                return (
                  <tr key={assignment.id}>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      <p className="font-medium">{assignment.title}</p>
                      {assignment.description ? (
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{assignment.description}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {assignment.student?.student_name ?? 'Unknown student'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{formatDate(assignment.due_date)}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <a
                          href={assignment.resource_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm shadow-slate-400 transition-all duration-150 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          Download Assignment
                        </a>
                        <ViewSubmissionsModal assignmentId={assignment.id} assignmentTitle={assignment.title} />
                        <DeleteAssignmentButton assignmentId={assignment.id} assignmentTitle={assignment.title} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
