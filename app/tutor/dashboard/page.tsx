import { getExamCountdown, getTutorDashboardData } from '@/app/actions/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Hourglass, CreditCard, FileText, Users, DollarSign, PoundSterling, PoundSterlingIcon, SquareChevronRight, Wand2, HandCoins, GraduationCap } from 'lucide-react';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatSessionTime(startTime: string, endTime: string) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });

  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const start = new Date(startTime);
  const end = new Date(endTime);

  return `${formatter.format(start)} · ${timeFormatter.format(end)}`;
}

function getMonthName() {
  return new Date().toLocaleDateString('en-GB', { month: 'long' });
}

export default async function TutorDashboardPage() {
  const dashboardData = await getTutorDashboardData();
  const examCountdown = await getExamCountdown();
  const hasRevenue = dashboardData.unpaidInvoicesTotal > 0;

  return (
    <main className="space-y-5 sm:space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className={hasRevenue ? 'border-amber-200 bg-amber-50/80' : 'border-slate-300 shadow-md shadow-slate-400'}>
          <CardHeader>
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-500">
                Unpaid Revenue
              </p>
              <HandCoins className="h-4 w-4 mb-0.5 text-amber-600" />
            </div>
            <CardTitle className={hasRevenue ? 'text-amber-900' : 'text-slate-900'}>
              {formatCurrency(dashboardData.unpaidInvoicesTotal)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={hasRevenue ? 'text-sm text-amber-900/80' : 'text-sm text-slate-600'}>
              Outstanding invoices waiting to be paid.
            </p>
          </CardContent>
        </Card>

        <Card className='border-slate-300 shadow-md shadow-slate-400'>
          <CardHeader>
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-500">
                Next Session
              </p>
              <GraduationCap className="h-4 w-4 mb-0.5 text-blue-600" />
            </div>
            <CardTitle>{dashboardData.upcomingSessions.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Upcoming sessions scheduled over the next 7 days.</p>
          </CardContent>
        </Card>

        <Card className='border-slate-300 shadow-md shadow-slate-400'>
          <CardHeader>
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-red-500">
                Pending Marking
              </p>
              <FileText className="h-4 w-4 mb-0.5 text-red-600" />
            </div>
            <CardTitle>{dashboardData.pendingAssignments}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Assignments still waiting for feedback.</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3 border-slate-300 shadow-md shadow-slate-400">
          <CardHeader>
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Upcoming Lessons
              </p>
              <Clock className="h-4 w-4 mb-0.5 text-slate-600" />
            </div>
            <CardTitle>Next 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.upcomingSessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                No lessons scheduled for the next 7 days.
              </div>
            ) : (
              <div className="max-h-[15.5rem] space-y-3 overflow-y-auto pr-1">
                {dashboardData.upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col gap-1 rounded-2xl border border-slate-200 shadow-sm shadow-rose-300 bg-gradient-to-b from-rose-100/80 via-rose-50 to-rose-100/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{session.student_name}</p>
                      <p className="text-sm text-blue-700">{session.subject ?? 'Lesson'}</p>
                    </div>
                    <p className="text-sm font-medium text-green-600">{formatSessionTime(session.start_time, session.end_time)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden lg:col-span-2 border-slate-300 shadow-md shadow-slate-400">
          <div className="bg-gradient-to-br from-violet-500 via-violet-400 to-violet-300 px-6 py-6 text-white sm:px-7 sm:py-7">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/65">
              GCSE & A-Level Countdown
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              Summer exam pressure is building<span className="typing-dots" aria-hidden="true">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </h2>
            <div className="mt-6 flex items-end gap-3">
              <span className="text-6xl text-yellow-200 font-bold leading-none sm:text-7xl">{examCountdown.days}</span>
              <span className="pb-1 text-md font-bold uppercase tracking-[0.2em] text-white/70">
                days left <Clock className="ml-1 h-4 w-4" />
              </span>
            </div>
          </div>
          <CardContent className="space-y-3 p-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black">Weeks</p>
                <p className="mt-1 text-lg font-bold text-red-500">{examCountdown.weeks}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black">Months</p>
                <p className="mt-1 text-lg font-bold text-red-500">{examCountdown.months}</p>
              </div>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              The core GCSE exam period starts on 15 May {examCountdown.targetDate.getUTCFullYear()}.
              Use the runway to keep revision, homework, and marking moving in parallel.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-300 shadow-md shadow-slate-400">
          <CardHeader>
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-green-500">
                Revenue This Month 
              </p>
              <PoundSterlingIcon className="h-4 w-4 mb-0.5 text-green-600" />
            </div>
            <CardTitle>{getMonthName()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Paid</p>
                  <p className="mt-1 text-lg font-semibold text-green-600">{formatCurrency(dashboardData.paidThisMonth)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Outstanding</p>
                  <p className="mt-1 text-lg font-semibold text-amber-600">{formatCurrency(dashboardData.unpaidThisMonth)}</p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-amber-500"
                  style={{
                    width: dashboardData.paidThisMonth + dashboardData.unpaidThisMonth > 0
                      ? `${(dashboardData.paidThisMonth / (dashboardData.paidThisMonth + dashboardData.unpaidThisMonth)) * 100}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {dashboardData.nextSession ? (
          <Card className="border-slate-300 shadow-md shadow-slate-400">
            <CardHeader>
              <div className="flex items-center gap-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-500">
                  Next Up
                </p>
                <SquareChevronRight className="h-4 w-4 mb-0.5 text-blue-600" />
              </div>
              <CardTitle className="truncate">{dashboardData.nextSession.student_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Subject</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{dashboardData.nextSession.subject ?? 'Lesson'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Scheduled</p>
                  <p className="mt-1 text-sm font-mono text-red-700">{formatSessionTime(dashboardData.nextSession.start_time, dashboardData.nextSession.end_time)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        <Card className="border-slate-300 shadow-md shadow-slate-400">
          <CardHeader>
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-500">
                Quick Actions
              </p>
              <Wand2 className="h-4 w-4 mb-0.5 text-violet-600" />
            </div>
            <CardTitle>Navigate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="/tutor/schedule"
                className="flex flex-col hover:scale-105 items-center gap-2 rounded-xl border border-slate-300 shadow-sm shadow-slate-400 bg-gradient-to-b from-blue-100 via-blue-50 to-blue-100 px-3 py-3 text-center transition hover:border-blue-300 hover:bg-blue-50"
              >
                <Clock className="h-5 w-5 text-slate-600" />
                <span className="text-xs font-semibold text-slate-700">Schedule</span>
              </a>
              <a
                href="/tutor/billing"
                className="flex flex-col hover:scale-105 items-center gap-2 rounded-xl border border-slate-300 shadow-sm shadow-slate-400 bg-gradient-to-b from-green-100 via-green-50 to-green-100 px-3 py-3 text-center transition hover:border-green-300 hover:bg-green-50"
              >
                <CreditCard className="h-5 w-5 text-slate-600" />
                <span className="text-xs font-semibold text-slate-700">Invoices</span>
              </a>
              <a
                href="/tutor/assignments"
                className="flex flex-col hover:scale-105 items-center gap-2 rounded-xl border border-slate-300 shadow-sm shadow-slate-400 bg-gradient-to-b from-purple-100 via-purple-50 to-purple-100  px-3 py-3 text-center transition hover:border-purple-300 hover:bg-purple-50"
              >
                <FileText className="h-5 w-5 text-slate-600" />
                <span className="text-xs font-semibold text-slate-700">Assign</span>
              </a>
              <a
                href="/tutor/students"
                className="flex flex-col hover:scale-105 items-center gap-2 rounded-xl border border-slate-300 shadow-sm shadow-slate-400 bg-gradient-to-b from-amber-100 via-amber-50 to-amber-100 px-3 py-3 text-center transition hover:border-amber-300 hover:bg-amber-50"
              >
                <Users className="h-5 w-5 text-slate-600" />
                <span className="text-xs font-semibold text-slate-700">Students</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
