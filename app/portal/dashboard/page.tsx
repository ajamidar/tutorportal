import Link from 'next/link';
import { getClientOverview, getClientPortalIdentity, getClientProfile } from '@/app/actions/portal';
import { ProgressTracker } from '@/components/portal/ProgressTracker';

type GroupedLesson = {
  id: string;
  subject: string | null;
  date: string;
  time: string;
};

function formatSessionDateTime(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  return {
    date: new Intl.DateTimeFormat('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
    }).format(startDate),
    time: `${new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(startDate)} - ${new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(endDate)}`,
  };
}

function toStartOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getWeekEnd(value: Date) {
  const start = toStartOfDay(value);
  const day = start.getDay();
  const daysUntilSunday = (7 - day) % 7;
  start.setDate(start.getDate() + daysUntilSunday);
  return start;
}

function getLessonGroupLabel(sessionStartIso: string, now = new Date()) {
  const sessionDate = toStartOfDay(new Date(sessionStartIso));
  const today = toStartOfDay(now);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (sessionDate.getTime() === today.getTime()) {
    return 'Today';
  }

  if (sessionDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }

  const weekEnd = getWeekEnd(today);

  if (sessionDate > tomorrow && sessionDate <= weekEnd) {
    return 'This Week';
  }

  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(sessionDate);
}

export default async function PortalDashboardPage() {
  const [profile, overview, identity] = await Promise.all([
    getClientProfile(),
    getClientOverview(),
    getClientPortalIdentity(),
  ]);

  const groupedSessions = overview.upcomingSessions.reduce<Record<string, GroupedLesson[]>>((acc, session) => {
    const label = getLessonGroupLabel(session.start_time);
    const lesson = formatSessionDateTime(session.start_time, session.end_time);

    if (!acc[label]) {
      acc[label] = [];
    }

    acc[label].push({
      id: session.id,
      subject: session.subject,
      date: lesson.date,
      time: lesson.time,
    });

    return acc;
  }, {});

  const orderedGroupLabels = Object.keys(groupedSessions);

  return (
    <main className="space-y-4 sm:space-y-5">
      {identity.linkedProfileCount === 0 ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-semibold text-rose-900">No student data linked to this login</p>
          <p className="mt-1 text-sm text-rose-800">
            Signed in as {identity.email ?? 'unknown email'}. Ask your tutor to add this exact email in
            the student roster.
          </p>
        </section>
      ) : null}

      <ProgressTracker
        completedLessonsThisMonth={overview.monthlyCompletedLessonCount}
        submittedHomeworkThisMonth={overview.monthlySubmittedHomeworkCount}
        monthLabel={overview.monthlyProgressLabel}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900 sm:text-lg">Action Needed</h2>
          <span className="text-xs font-medium text-slate-500">This week</span>
        </div>

        <div className="space-y-3">
          {overview.unpaidInvoiceCount > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">Outstanding invoice</p>
              <p className="mt-1 text-sm text-amber-800">
                You have {overview.unpaidInvoiceCount} unpaid invoice
                {overview.unpaidInvoiceCount === 1 ? '' : 's'}.
              </p>
              <div className="mt-3">
                <Link
                  href={overview.unpaidInvoicePaymentLink ?? '/portal/billing'}
                  className="inline-flex h-9 items-center justify-center rounded-xl bg-amber-500 px-4 text-sm font-semibold text-white transition hover:bg-amber-600"
                  target={overview.unpaidInvoicePaymentLink ? '_blank' : undefined}
                  rel={overview.unpaidInvoicePaymentLink ? 'noreferrer' : undefined}
                >
                  Pay Now
                </Link>
              </div>
            </div>
          )}

          {overview.pendingAssignmentCount > 0 && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-900">Homework pending</p>
              <p className="mt-1 text-sm text-blue-800">
                {overview.pendingAssignmentCount} assignment
                {overview.pendingAssignmentCount === 1 ? '' : 's'} waiting for submission.
              </p>
              <div className="mt-3">
                <Link
                  href="/portal/assignments"
                  className="inline-flex h-9 items-center justify-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                >
                  View Homework
                </Link>
              </div>
            </div>
          )}

          {overview.unpaidInvoiceCount === 0 && overview.pendingAssignmentCount === 0 && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-900">All clear</p>
              <p className="mt-1 text-sm text-emerald-800">
                No urgent actions right now. Great consistency.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-slate-900 sm:text-lg">Upcoming Lessons</h2>

        {overview.upcomingSessions.length > 0 ? (
          <div className="mt-3 space-y-4">
            {orderedGroupLabels.map((label, index) => (
              <details
                key={label}
                open={index === 0}
                className="group rounded-2xl border border-slate-200 bg-white p-3"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
                  <span className="text-xs font-medium text-slate-500 transition group-open:rotate-180">
                    ▼
                  </span>
                </summary>

                <div className="mt-3 space-y-3">
                  {groupedSessions[label].map((session) => (
                    <div key={session.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">{session.date}</p>
                      <p className="mt-1 text-sm text-slate-700">{session.time}</p>
                      {session.subject ? (
                        <p className="mt-2 inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                          {session.subject}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            No upcoming lessons are scheduled yet.
          </p>
        )}

        {profile?.exam_board ? (
          <p className="mt-3 text-xs text-slate-500">Exam board: {profile.exam_board}</p>
        ) : null}
      </section>
    </main>
  );
}
