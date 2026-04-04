import Link from 'next/link';
import { getTutorSessions } from '@/app/actions/sessions';
import { getTutorStudents } from '@/app/actions/students';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookSessionModal } from './book-session-modal';
import { ManageSessionActions } from './manage-session-actions';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

type TutorSchedulePageProps = {
  searchParams: Promise<{ year?: string; month?: string; day?: string; view?: string }>;
};

type DayCell = {
  date: Date;
  inCurrentMonth: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

function toMonthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function parseCalendarState(params: { year?: string; month?: string; day?: string }) {
  const now = new Date();
  const parsedYear = Number.parseInt(params.year ?? '', 10);
  const parsedMonth = Number.parseInt(params.month ?? '', 10);
  const safeYear = Number.isFinite(parsedYear) ? clamp(parsedYear, 2000, 2100) : now.getFullYear();
  const safeMonth = Number.isFinite(parsedMonth) ? clamp(parsedMonth, 1, 12) : now.getMonth() + 1;

  const monthDays = getDaysInMonth(safeYear, safeMonth);
  const parsedDay = Number.parseInt(params.day ?? '', 10);
  const safeDay = Number.isFinite(parsedDay) ? clamp(parsedDay, 1, monthDays) : now.getDate();

  return { year: safeYear, month: safeMonth, day: safeDay };
}

function buildMonthGrid(year: number, month: number): DayCell[] {
  const firstOfMonth = new Date(year, month - 1, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(firstOfMonth.getDate() - firstWeekday);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return {
      date,
      inCurrentMonth: date.getMonth() === month - 1,
    };
  });
}

function toQueryHref(year: number, month: number, day: number) {
  return `/tutor/schedule?year=${year}&month=${month}&day=${day}`;
}

function toQueryHrefWithView(year: number, month: number, day: number, view: 'scheduled' | 'cancelled') {
  return `/tutor/schedule?year=${year}&month=${month}&day=${day}&view=${view}`;
}

function formatMonthTitle(year: number, month: number) {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function formatMonthNavLabel(year: number, month: number) {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isSameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function getAdjacentMonth(year: number, month: number, delta: number) {
  const date = new Date(year, month - 1 + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export default async function TutorSchedulePage({ searchParams }: TutorSchedulePageProps) {
  const params = await searchParams;
  const { year, month, day } = parseCalendarState(params);
  const activeView: 'scheduled' | 'cancelled' = params.view === 'cancelled' ? 'cancelled' : 'scheduled';

  const { start: monthStart, end: monthEnd } = toMonthRange(year, month);

  const [sessions, students] = await Promise.all([
    getTutorSessions(monthStart.toISOString(), monthEnd.toISOString(), activeView),
    getTutorStudents(),
  ]);

  const groupedStudentMap = new Map<
    string,
    {
      studentKey: string;
      studentName: string;
      level: 'gcse' | 'a_level';
      clientEmail: string;
      clientFullName: string | null;
      subjects: Array<{
        id: string;
        subject: string;
        examBoard: string;
        currentWorkingGrade: string | null;
        targetGrade: string | null;
      }>;
    }
  >();

  for (const student of students) {
    const key = `${student.client_id}:${student.student_name}:${student.level}`;
    const existing = groupedStudentMap.get(key);
    const subjectEntry = {
      id: student.id,
      subject: student.subject,
      examBoard: student.exam_board,
      currentWorkingGrade: student.current_working_grade,
      targetGrade: student.target_grade,
    };

    if (!existing) {
      groupedStudentMap.set(key, {
        studentKey: key,
        studentName: student.student_name,
        level: student.level,
        clientEmail: student.client.email,
        clientFullName: student.client.full_name,
        subjects: [subjectEntry],
      });
      continue;
    }

    existing.subjects.push(subjectEntry);
  }

  const studentOptions = Array.from(groupedStudentMap.values()).sort((a, b) =>
    a.studentName.localeCompare(b.studentName)
  );

  const daysInMonth = getDaysInMonth(year, month);
  const selectedDay = clamp(day, 1, daysInMonth);
  const selectedDate = new Date(year, month - 1, selectedDay);

  const sessionsByDay = new Map<number, typeof sessions>();
  for (const session of sessions) {
    const sessionDate = new Date(session.start_time);
    const dayNumber = sessionDate.getDate();
    const list = sessionsByDay.get(dayNumber) ?? [];
    list.push(session);
    sessionsByDay.set(dayNumber, list);
  }

  const selectedDaySessions = (sessionsByDay.get(selectedDay) ?? []).sort(
    (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  const grid = buildMonthGrid(year, month);

  const previousMonth = getAdjacentMonth(year, month, -1);
  const nextMonth = getAdjacentMonth(year, month, 1);

  const now = new Date();
  const todayHref = toQueryHrefWithView(now.getFullYear(), now.getMonth() + 1, now.getDate(), activeView);

  return (
    <Card className='border-slate-300 shadow-md shadow-slate-500'>
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Planning</p>
          <CardTitle>Schedule Calendar</CardTitle>
          <p className="mt-1 text-sm text-slate-600">Browse sessions by date across past and future months/years.</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href={toQueryHrefWithView(previousMonth.year, previousMonth.month, 1, activeView)}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-400 bg-slate-300 px-2 text-sm font-medium text-black transition hover:border-slate-400 hover:bg-slate-400 "
            >
              <ChevronLeft className='h-6 w-6' />
            </Link>
            <Link
              href={todayHref}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-400 bg-slate-300 px-3 text-sm font-medium text-black transition hover:border-slate-400 hover:bg-slate-400 "
            >
              This Month
            </Link>
            <Link
              href={toQueryHrefWithView(nextMonth.year, nextMonth.month, 1, activeView)}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-400 bg-slate-300 px-2 text-sm font-medium text-black transition hover:border-slate-400 hover:bg-slate-400"
            >
              <ChevronRight className='h-6 w-6' />
            </Link>
          </div>

          <div className="mt-3 inline-flex rounded-lg border border-slate-300 bg-white p-1">
            <Link
              href={toQueryHrefWithView(year, month, selectedDay, 'scheduled')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition ${activeView === 'scheduled'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              Scheduled
            </Link>
            <Link
              href={toQueryHrefWithView(year, month, selectedDay, 'cancelled')}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] transition ${activeView === 'cancelled'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
              Cancelled
            </Link>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
          <BookSessionModal students={studentOptions} />
          <form action="/tutor/schedule" method="get" className="flex w-full items-center gap-2 sm:w-auto">
            <select
              name="month"
              defaultValue={String(month)}
              className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-700"
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map((monthNumber) => (
                <option key={monthNumber} value={monthNumber}>
                  {new Date(2000, monthNumber - 1, 1).toLocaleDateString('en-GB', { month: 'long' })}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="year"
              defaultValue={year}
              min={2000}
              max={2100}
              className="h-9 w-24 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-700"
            />
            <input type="hidden" name="day" value="1" />
            <input type="hidden" name="view" value={activeView} />
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              Go <ArrowUpRight className='h-5 w-5' />
            </button>
          </form>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-[#d0e9fb] to-[#f0f7ff] p-3 shadow-sm sm:p-4 shadow-slate-300">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">{formatMonthTitle(year, month)}</h3>
            <p className="text-xs text-slate-500">Tap a date to view sessions</p>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-black sm:gap-2 bg-slate-300 p-2 rounded-lg">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          <div className="mt-2 grid grid-cols-7 gap-1 sm:gap-2 bg-slate-200 p-2 rounded-lg">
            {grid.map((cell) => {
              const cellYear = cell.date.getFullYear();
              const cellMonth = cell.date.getMonth() + 1;
              const cellDay = cell.date.getDate();
              const isSelected = isSameDate(cell.date, selectedDate);
              const isToday = isSameDate(cell.date, now);
              const daySessions = cell.inCurrentMonth ? sessionsByDay.get(cellDay) ?? [] : [];

              return (
                <Link
                  key={`${cellYear}-${cellMonth}-${cellDay}`}
                  href={toQueryHrefWithView(cellYear, cellMonth, cellDay, activeView)}
                  className={`rounded-xl border p-2 text-left transition sm:p-2.5 ${isSelected
                    ? 'border-slate-700 bg-blue-200 shadow-sm'
                    : cell.inCurrentMonth
                      ? 'border-slate-700 bg-white hover:border-blue-200 hover:bg-blue-50/40'
                      : 'border-slate-300 bg-slate-50 text-slate-400 hover:border-slate-200'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${isToday ? 'rounded-full bg-blue-600 px-2 py-0.5 text-white' : 'text-slate-800'
                        }`}
                    >
                      {cellDay}
                    </span>
                    {daySessions.length > 0 ? (
                      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                        {daySessions.length}
                      </span>
                    ) : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-green-500 hover:shadow-blue-300 hover:cursor-pointer transition">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-slate-900">
              {selectedDate.toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </h4>
            <Badge variant={activeView === 'scheduled' ? 'success' : 'warning'}>
              {activeView === 'scheduled' ? 'Scheduled View' : 'Cancelled View'}
            </Badge>
          </div>

          {selectedDaySessions.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              {activeView === 'scheduled'
                ? 'No sessions scheduled for this date.'
                : 'No cancelled lessons for this date.'}
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              {selectedDaySessions.map((session) => (
                <article key={session.id} className="rounded-xl border border-green-200 hover:border-green-400 hover:shadow-sm hover:shadow-green-400 hover:cursor-pointer transition bg-gradient-to-b from-green-100 via-green-50 to-green-100 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-black">
                      {session.student?.student_name ?? 'Student'}
                    </p>
                    <div className="flex items-center gap-2">
                      {session.is_recurring ? (
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-green-700">
                          Recurring
                        </span>
                      ) : null}
                      <Badge variant={session.status === 'cancelled' ? 'warning' : 'success'}>
                        {session.status === 'cancelled' ? 'Cancelled' : 'Scheduled'}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">
                    {formatTime(session.start_time)} - {formatTime(session.end_time)}
                  </p>
                  {session.subject ? (
                    <p className="mt-1 text-xs font-medium text-blue-700">{session.subject}</p>
                  ) : null}

                  {session.status === 'cancelled' && session.cancelled_at ? (
                    <p className="mt-2 text-xs font-medium text-amber-800">
                      Cancelled on {formatDateTime(session.cancelled_at)}
                    </p>
                  ) : null}

                  {session.status === 'scheduled' ? (
                    <ManageSessionActions
                      sessionId={session.id}
                      studentName={session.student?.student_name ?? 'Student'}
                      startTime={session.start_time}
                      endTime={session.end_time}
                    />
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
