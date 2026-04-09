'use client';

type ProgressTrackerProps = {
  completedLessonsThisMonth: number;
  submittedHomeworkThisMonth: number;
  monthLabel: string;
};

type Milestone = {
  key: string;
  title: string;
  targetLessons: number;
  targetHomework: number;
};

const milestones: Milestone[] = [
  { key: 'momentum', title: 'Momentum', targetLessons: 4, targetHomework: 3 },
  { key: 'consistency', title: 'Consistency', targetLessons: 8, targetHomework: 6 },
  { key: 'mastery', title: 'Mastery Sprint', targetLessons: 12, targetHomework: 10 },
];

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export function ProgressTracker({
  completedLessonsThisMonth,
  submittedHomeworkThisMonth,
  monthLabel,
}: ProgressTrackerProps) {
  const safeCompletedLessons = Math.max(0, completedLessonsThisMonth);
  const safeSubmittedHomework = Math.max(0, submittedHomeworkThisMonth);

  const currentMilestoneIndex = milestones.findIndex(
    (milestone) =>
      safeCompletedLessons < milestone.targetLessons || safeSubmittedHomework < milestone.targetHomework
  );

  const activeMilestone =
    currentMilestoneIndex === -1 ? milestones[milestones.length - 1] : milestones[currentMilestoneIndex];

  const reachedAllMilestones = currentMilestoneIndex === -1;

  const lessonProgress = clampPercent((safeCompletedLessons / activeMilestone.targetLessons) * 100);
  const homeworkProgress = clampPercent((safeSubmittedHomework / activeMilestone.targetHomework) * 100);

  const lessonsRemaining = Math.max(activeMilestone.targetLessons - safeCompletedLessons, 0);
  const homeworkRemaining = Math.max(activeMilestone.targetHomework - safeSubmittedHomework, 0);


  return (
    <section className="relative overflow-hidden rounded-3xl border border-emerald-200 shadow-emerald-300 bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100 p-5 shadow-sm sm:p-6">
      <div className="pointer-events-none absolute -right-8 -top-12 h-28 w-28 rounded-full bg-blue-100/50 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-emerald-100/70 blur-2xl" />

      <div className="relative z-10">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Progress tracker</p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          Monthly consistency milestones
        </h2>
        <p className="mt-1 text-sm text-slate-600">Tracking for {monthLabel}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200 shadow-sm shadow-slate-300 bg-white/90 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Lessons Completed</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{safeCompletedLessons}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 shadow-sm shadow-slate-300 bg-white/90 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Homework Submitted</p>
            <p className="mt-1 text-xl font-semibold text-slate-900">{safeSubmittedHomework}</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 shadow-sm shadow-slate-300 bg-white/90 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current milestone</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              {reachedAllMilestones ? 'All milestones complete' : activeMilestone.title}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                <span>Lessons</span>
                <span>
                  {safeCompletedLessons}/{activeMilestone.targetLessons}
                </span>
            </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${lessonProgress}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                <span>Homework</span>
                <span>
                  {safeSubmittedHomework}/{activeMilestone.targetHomework}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-cyan-500 transition-all"
                  style={{ width: `${homeworkProgress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
            {milestones.map((milestone, index) => {
              const isReached =
                safeCompletedLessons >= milestone.targetLessons &&
                safeSubmittedHomework >= milestone.targetHomework;
              const isActive = milestone.key === activeMilestone.key && !reachedAllMilestones;

              return (
                <div key={milestone.key} className="flex items-center">
                  <div
                    className={[
                      'rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap',
                      isReached
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : isActive
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                          : 'border-slate-200 bg-white text-slate-500',
                    ].join(' ')}
                  >
                    {milestone.title}
                  </div>
                  {index < milestones.length - 1 ? <div className="mx-2 h-px w-4 bg-slate-300" /> : null}
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-600">
          {reachedAllMilestones
            ? `Excellent work this month. Keep this rhythm through ${monthLabel}.`
            : `This month, you are ${lessonsRemaining} lesson${lessonsRemaining === 1 ? '' : 's'} and ${homeworkRemaining} homework submission${homeworkRemaining === 1 ? '' : 's'} away from ${activeMilestone.title}.`}
        </p>
      </div>
    </section>
  );
}