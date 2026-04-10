import { PAIN_POINTS } from './data';
import type { Tokens } from './tokens';

interface Props { t: Tokens; }

/** "Sound familiar?" section — lists common tutor pain points. Add/edit pains in data.ts. */
export function PainSection({ t }: Props) {
  return (
    <section className="relative z-10 px-6 !bg-black py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-3 text-center" data-animate>
          <span
            className="inline-block rounded-full border px-4 py-1 text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)', color: '#ef4444' }}
          >
            The problem
          </span>
        </div>
        <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl" data-animate style={{ color: t.painHeadline }}>
          Sound familiar?
        </h2>
        <p className="mx-auto mb-12 max-w-xl text-center" data-animate style={{ color: t.painText }}>
          You became a tutor to teach — not to manage a business. But without the right tools, admin takes over.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          {PAIN_POINTS.map((p, i) => (
            <div
              key={p.title}
              data-animate
              data-delay={String(i + 1)}
              className="pain-card flex gap-5 rounded-2xl border p-6"
              style={{ background: t.painCardBg, borderColor: t.painCardBorder }}
            >
              <div
                className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${p.color}18`, color: p.color }}
              >
                <p.Icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="mb-1.5 font-semibold" style={{ color: p.color }}>{p.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: t.painText }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center" data-animate>
          <p className="text-2xl font-bold sm:text-3xl" style={{ color: t.painHeadline }}>
            TutorFlow handles all of it.
          </p>
          <p className="mt-2" style={{ color: t.painText }}>One platform. Every tool your tutoring business needs.</p>
        </div>
      </div>
    </section>
  );
}
