'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, PoundSterling, CheckCircle2, Clock } from 'lucide-react';

type MonthlyEarningsWidgetProps = {
  totalPaidPence: number;
  totalUnpaidPence: number;
  invoiceCount: number;
  paidCount: number;
  monthLabel: string;
};

function formatPounds(pence: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(pence / 100);
}

export function MonthlyEarningsWidget({
  totalPaidPence,
  totalUnpaidPence,
  invoiceCount,
  paidCount,
  monthLabel,
}: MonthlyEarningsWidgetProps) {
  const totalPence = totalPaidPence + totalUnpaidPence;
  const paidRatio = totalPence > 0 ? totalPaidPence / totalPence : 0;
  const unpaidCount = invoiceCount - paidCount;

  // Donut chart geometry
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const paidArc = circumference * paidRatio;
  const unpaidArc = circumference - paidArc;

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white shadow-xl shadow-emerald-200/50 h-full flex flex-col">
      {/* Decorative circles */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-6 -left-6 h-28 w-28 rounded-full bg-white/10" />

      <CardContent className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 py-6 sm:flex-row sm:items-center sm:gap-8 sm:px-8 sm:py-8">
        {/* Donut chart */}
        <div className="relative flex-shrink-0">
          <svg width="170" height="170" viewBox="0 0 170 170" className="drop-shadow-lg">
            {/* background ring */}
            <circle
              cx="85"
              cy="85"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="14"
            />
            {/* unpaid arc */}
            {totalPence > 0 && unpaidArc > 0 && (
              <circle
                cx="85"
                cy="85"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="14"
                strokeDasharray={`${unpaidArc} ${circumference}`}
                strokeDashoffset={-paidArc}
                strokeLinecap="round"
                transform="rotate(-90 85 85)"
                className="transition-all duration-1000 ease-out"
              />
            )}
            {/* paid arc */}
            {totalPence > 0 && paidArc > 0 && (
              <circle
                cx="85"
                cy="85"
                r={radius}
                fill="none"
                stroke="#ffffff"
                strokeWidth="14"
                strokeDasharray={`${paidArc} ${circumference}`}
                strokeDashoffset={0}
                strokeLinecap="round"
                transform="rotate(-90 85 85)"
                className="transition-all duration-1000 ease-out"
              />
            )}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tracking-tight">
              {totalPence > 0 ? `${Math.round(paidRatio * 100)}%` : '—'}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-widest text-white/80">
              collected
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-1 flex-col gap-4 text-center sm:text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
              {monthLabel}
            </p>
            <div className="mt-1 flex items-center justify-center gap-2 sm:justify-start">
              <PoundSterling className="h-6 w-6 text-white/80" />
              <span className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                {formatPounds(totalPaidPence)}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-white/70">Earned this month</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
            <div className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 backdrop-blur-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-200" />
              <span className="text-sm font-semibold">{paidCount}</span>
              <span className="text-xs text-white/70">paid</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 backdrop-blur-sm">
              <Clock className="h-4 w-4 text-amber-200" />
              <span className="text-sm font-semibold">{unpaidCount}</span>
              <span className="text-xs text-white/70">pending</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-white/15 px-3 py-1.5 backdrop-blur-sm">
              <TrendingUp className="h-4 w-4 text-cyan-200" />
              <span className="text-sm font-semibold">{formatPounds(totalUnpaidPence)}</span>
              <span className="text-xs text-white/70">outstanding</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
