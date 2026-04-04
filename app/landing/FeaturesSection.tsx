import { FEATURES } from './data';
import type { Tokens } from './tokens';

interface Props { t: Tokens; }

/** 6-card feature grid. Each card links back to a specific pain point via the "Fixes:" badge. */
export function FeaturesSection({ t }: Props) {
  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
      <div className="mb-14 text-center" data-animate>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: t.sectionLabel }}>Your solution</p>
        <h2 className="mt-2 text-3xl font-bold sm:text-4xl" style={{ color: t.sectionH2 }}>One portal. Every tool.</h2>
        <p className="mx-auto mt-3 max-w-xl" style={{ color: t.sectionP }}>
          Each feature directly fixes a real pain point — so you spend less time on admin and more time teaching.
        </p>
      </div>

      {/* CSS custom props on the grid drive hover states — zero JS event handlers needed */}
      <div
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        style={{
          '--card-bg':           t.cardBg,
          '--card-border':       t.cardBorder,
          '--card-hover-bg':     t.cardHoverBg,
          '--card-hover-border': t.cardHoverBorder,
          '--card-base-shadow':  t.cardBaseShadow,
          '--card-hover-shadow': t.cardHoverShadow,
        } as React.CSSProperties}
      >
        {FEATURES.map((f, i) => (
          <div key={f.title} data-animate data-delay={String((i % 3) + 1)} className="feature-card rounded-2xl border p-6">
            <div
              className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl"
              style={{ background: `${f.color}1a`, color: f.color }}
            >
              <f.Icon className="h-6 w-6" />
            </div>
            <div className="mb-3">
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ background: `${f.color}15`, color: f.color }}
              >
                Fixes: {f.solves}
              </span>
            </div>
            <h3 className="mb-2 text-base font-semibold" style={{ color: t.cardTitle }}>{f.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: t.cardDesc }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
