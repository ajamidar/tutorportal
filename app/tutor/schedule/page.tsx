import Link from 'next/link';
import { getTutorSessions } from '@/app/actions/sessions';
import { getTutorStudents } from '@/app/actions/students';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookSessionModal } from './book-session-modal';

type TutorSchedulePageProps = {
  searchParams: Promise<{ year?: string; month?: string; day?: string }>;
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

  const { start: monthStart, end: monthEnd } = toMonthRange(year, month);

  const [sessions, students] = await Promise.all([
    getTutorSessions(monthStart.toISOString(), monthEnd.toISOString()),
    getTutorStudents(),
  ]);

  const studentOptions = students.map((student) => ({
    id: student.id,
    student_name: student.student_name,
    target_grade: student.target_grade,
  }));

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
  const todayHref = toQueryHref(now.getFullYear(), now.getMonth() + 1, now.getDate());

  return (
    <Card className='border-slate-300 shadow-md shadow-slate-500'>
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Planning</p>
          <CardTitle>Schedule Calendar</CardTitle>
          <p className="mt-1 text-sm text-slate-600">Browse sessions by date across past and future months/years.</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Link
              href={toQueryHref(previousMonth.year, previousMonth.month, 1)}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-400 bg-slate-300 px-3 text-sm font-medium text-black transition hover:border-slate-400 hover:bg-slate-200 "
            >
              {formatMonthNavLabel(previousMonth.year, previousMonth.month)}
            </Link>
            <Link
              href={todayHref}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-400 bg-slate-300 px-3 text-sm font-medium text-black transition hover:border-slate-400 hover:bg-slate-200 "
            >
              Today
            </Link>
            <Link
              href={toQueryHref(nextMonth.year, nextMonth.month, 1)}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-400 bg-slate-300 px-3 text-sm font-medium text-black transition hover:border-slate-400 hover:bg-slate-200"
            >
              {formatMonthNavLabel(nextMonth.year, nextMonth.month)}
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
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              Go
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
                  href={toQueryHref(cellYear, cellMonth, cellDay)}
                  className={`rounded-xl border p-2 text-left transition sm:p-2.5 ${
                    isSelected
                      ? 'border-slate-700 bg-blue-200 shadow-sm'
                      : cell.inCurrentMonth
                        ? 'border-slate-700 bg-white hover:border-blue-200 hover:bg-blue-50/40'
                        : 'border-slate-300 bg-slate-50 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold ${
                        isToday ? 'rounded-full bg-blue-600 px-2 py-0.5 text-white' : 'text-slate-800'
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
          <h4 className="text-sm font-bold text-slate-900">
            {selectedDate.toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </h4>

          {selectedDaySessions.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No sessions scheduled for this date.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {selectedDaySessions.map((session) => (
                <article key={session.id} className="rounded-xl border border-green-400 bg-green-300 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-black">
                      {session.student?.student_name ?? 'Student'}
                    </p>
                    {session.is_recurring ? (
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-green-700">
                        Recurring
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-slate-700">
                    {formatTime(session.start_time)} - {formatTime(session.end_time)}
                  </p>
                  {session.student?.target_grade ? (
                    <p className="mt-1 text-xs text-slate-600">Target {session.student.target_grade}</p>
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
