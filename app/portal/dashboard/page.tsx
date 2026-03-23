export default function PortalDashboardPage() {
  return (
    <main className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">Welcome</p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">Client Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">
          You are signed in as a client. Mobile-first portal widgets come next.
        </p>
      </div>
    </main>
  );
}
