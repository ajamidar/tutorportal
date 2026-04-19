'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Sparkles } from 'lucide-react';

export type MonthlyDataPoint = {
  month: string;
  earningsPence: number;
};

type YearlyEarningsChartProps = {
  data: MonthlyDataPoint[];
  year: number;
};

function formatPounds(pence: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(pence / 100);
}

function formatPoundsCompact(pence: number) {
  const pounds = pence / 100;
  if (pounds >= 1000) return `£${(pounds / 1000).toFixed(1)}k`;
  return `£${Math.round(pounds)}`;
}

export function YearlyEarningsChart({ data, year }: YearlyEarningsChartProps) {
  const maxEarnings = Math.max(...data.map((d) => d.earningsPence), 1);
  const totalYear = data.reduce((sum, d) => sum + d.earningsPence, 0);
  const bestMonth = data.reduce((best, d) => (d.earningsPence > best.earningsPence ? d : best), data[0]);
  const currentMonth = new Date().getMonth();

  return (
    <Card className="relative overflow-hidden border border-slate-200/80 bg-white shadow-xl shadow-indigo-100/40">
      {/* Subtle background decoration */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br from-indigo-100/40 to-violet-100/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-gradient-to-tr from-cyan-100/30 to-blue-100/20 blur-2xl" />

      <CardContent className="relative z-10 px-5 py-6 sm:px-7 sm:py-7">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
                Annual Overview
              </p>
              <h3 className="text-lg font-bold tracking-tight text-slate-800">Earnings in {year}</h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {bestMonth.earningsPence > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200/60 px-3 py-1.5 text-xs font-semibold text-amber-600">
                <Sparkles className="h-3.5 w-3.5" />
                Best: {bestMonth.month}
              </div>
            )}
            <div className="rounded-xl bg-indigo-50 border border-indigo-200/60 px-4 py-2 text-sm font-bold text-indigo-700">
              {formatPounds(totalYear)}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="overflow-x-auto pb-1">
          <div className="flex items-end gap-[6px] sm:gap-2" style={{ minWidth: '480px', height: '200px' }}>
            {data.map((d, i) => {
              const heightPercent = maxEarnings > 0 ? (d.earningsPence / maxEarnings) * 100 : 0;
              const barHeight = d.earningsPence > 0 ? Math.max(heightPercent, 4) : 2;
              const isCurrentMonth = i === currentMonth;
              const isBestMonth = d === bestMonth && d.earningsPence > 0;
              const hasEarnings = d.earningsPence > 0;

              return (
                <div
                  key={d.month}
                  className="group relative flex flex-1 flex-col items-center justify-end"
                  style={{ height: '100%' }}
                >
                  {/* Tooltip on hover */}
                  {hasEarnings && (
                    <div className="pointer-events-none absolute -top-1 left-1/2 z-20 -translate-x-1/2 rounded-lg bg-slate-800 px-2.5 py-1.5 text-center opacity-0 shadow-xl transition-all duration-200 group-hover:-top-3 group-hover:opacity-100">
                      <p className="text-[10px] font-semibold text-slate-300">{d.month} {year}</p>
                      <p className="text-xs font-bold text-white">{formatPounds(d.earningsPence)}</p>
                      <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-800" />
                    </div>
                  )}

                  {/* Value label above bar */}
                  {hasEarnings && (
                    <span className="mb-1.5 text-[9px] font-bold text-slate-400 transition-colors group-hover:text-indigo-600 sm:text-[10px]">
                      {formatPoundsCompact(d.earningsPence)}
                    </span>
                  )}

                  {/* Bar */}
                  <div
                    className="relative w-full overflow-hidden rounded-t-lg transition-all duration-500 ease-out"
                    style={{
                      height: `${barHeight}%`,
                      minHeight: hasEarnings ? '8px' : '3px',
                    }}
                  >
                    {/* Bar fill */}
                    <div
                      className={`absolute inset-0 transition-all duration-300 ${
                        isBestMonth
                          ? 'bg-gradient-to-t from-amber-400 via-amber-300 to-yellow-200 shadow-inner'
                          : isCurrentMonth
                            ? 'bg-gradient-to-t from-cyan-500 via-cyan-400 to-teal-300 shadow-inner'
                            : hasEarnings
                              ? 'bg-gradient-to-t from-indigo-500 via-indigo-400 to-violet-300 group-hover:from-indigo-600 group-hover:via-indigo-500 group-hover:to-violet-400'
                              : 'bg-slate-100'
                      }`}
                    />

                    {/* Shine effect on hover */}
                    {hasEarnings && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    )}

                    {/* Glow on top for highlighted bars */}
                    {(isBestMonth || isCurrentMonth) && (
                      <div
                        className={`absolute -top-1 left-1/2 h-2 w-3/4 -translate-x-1/2 rounded-full blur-sm ${
                          isBestMonth ? 'bg-amber-300/50' : 'bg-cyan-300/50'
                        }`}
                      />
                    )}
                  </div>

                  {/* Month label */}
                  <span
                    className={`mt-2.5 text-[10px] font-semibold tracking-wide transition-colors sm:text-[11px] ${
                      isCurrentMonth
                        ? 'text-cyan-600'
                        : isBestMonth
                          ? 'text-amber-600'
                          : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  >
                    {d.month}
                  </span>

                  {/* Current month indicator dot */}
                  {isCurrentMonth && (
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-sm shadow-cyan-400/50" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4 text-[10px] font-medium text-slate-400 sm:gap-6 sm:text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-indigo-500 to-violet-300" />
            <span className="text-slate-500">Monthly Earnings</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-cyan-500 to-teal-300" />
            <span className="text-slate-500">Current Month</span>
          </div>
          {bestMonth.earningsPence > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-gradient-to-t from-amber-400 to-yellow-200" />
              <span className="text-slate-500">Best Month</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
