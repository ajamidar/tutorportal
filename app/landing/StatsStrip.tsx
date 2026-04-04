import { STATS } from './data';
import type { Tokens } from './tokens';

interface Props { t: Tokens; }

/** Key statistics strip. Edit numbers in data.ts → STATS. */
export function StatsStrip({ t }: Props) {
  return (
    <section
      className="relative z-10 border-y px-6 py-12"
      style={{ background: t.statsBg, borderColor: t.statsBorder }}
    >
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4">
        {STATS.map((s, i) => (
          <div key={s.label} data-animate data-delay={String(i + 1)} className="text-center">
            <p className="text-4xl font-extrabold sm:text-5xl" style={{ color: t.statsNum }}>{s.value}</p>
            <p className="mt-1.5 text-xs leading-snug" style={{ color: t.statsLabel }}>{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
