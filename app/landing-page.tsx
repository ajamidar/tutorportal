'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarDays, BookOpen, CreditCard, ChevronRight, GraduationCap,
  Users, BarChart3, CheckCircle2, Sparkles, ArrowRight, Moon, Sun,
  LogIn,
  CircleUserRound,
} from 'lucide-react';

// ─── Module-level constants (never recreated on render) ───────────────────────

const TYPED_WORD = 'simplified.';
const CURRENT_YEAR = new Date().getFullYear();

const DARK = {
  pageBg: 'linear-gradient(135deg, #0f0f1a 0%, #12122a 40%, #0d1a2e 100%)',
  blobA: '#6366f1', blobB: '#3b82f6', blobC: '#8b5cf6',
  navBg: 'rgba(15,15,26,0.85)',
  navBorder: 'rgba(255,255,255,0.08)',
  logoGrad: 'linear-gradient(135deg,#6366f1,#4f46e5)',
  brandText: '#ffffff',
  badgeBg: 'rgba(99,102,241,0.18)',
  badgeBorder: 'rgba(99,102,241,0.35)',
  badgeText: '#a5b4fc',
  h1Color: '#ffffff',
  h1Shadow: '0 0 80px rgba(99,102,241,0.3)',
  subText: '#94a3b8',
  ctaPrimary: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)',
  ctaPrimaryShadow: '0 4px 24px rgba(99,102,241,0.4)',
  ctaSecBg: 'rgba(255,255,255,0.08)',
  ctaSecBorder: 'rgba(255,255,255,0.18)',
  ctaSecText: '#ffffff',
  proofText: '#94a3b8',
  sectionLabel: '#818cf8',
  sectionH2: '#ffffff',
  sectionP: '#94a3b8',
  cardBg: 'rgba(255,255,255,0.05)',
  cardBorder: 'rgba(255,255,255,0.09)',
  cardHoverBg: 'rgba(255,255,255,0.1)',
  cardHoverBorder: 'rgba(99,102,241,0.4)',
  cardBaseShadow: 'none',
  cardHoverShadow: '0 20px 60px rgba(99,102,241,0.15)',
  cardTitle: '#ffffff',
  cardDesc: '#94a3b8',
  stepBg: 'rgba(255,255,255,0.06)',
  stepBorder: 'rgba(255,255,255,0.1)',
  stepBaseShadow: 'none',
  stepNum: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)',
  stepNumShadow: '0 4px 20px rgba(99,102,241,0.4)',
  stepTitle: '#ffffff',
  stepDesc: '#94a3b8',
  ctaBoxBg: 'linear-gradient(135deg,rgba(99,102,241,0.18) 0%,rgba(79,70,229,0.12) 100%)',
  ctaBoxBorder: 'rgba(99,102,241,0.3)',
  ctaBoxShadow: '0 0 80px rgba(99,102,241,0.12)',
  ctaH2: '#ffffff',
  ctaP: '#cbd5e1',
  footerBorder: 'rgba(255,255,255,0.08)',
  footerBrand: '#ffffff',
  footerCopy: '#475569',
  footerLink: '#475569',
  toggleBg: 'rgba(255,255,255,0.08)',
  toggleBorder: 'rgba(255,255,255,0.15)',
  toggleIcon: '#fbbf24',
  gradStart: '#818cf8',
  gradMid: '#6366f1',
  gradEnd: '#4f46e5',
  cursorColor: '#6366f1',
} as const;

const LIGHT = {
  pageBg: 'linear-gradient(160deg, #f0f7ff 0%, #dbeafe 35%, #f0f9ff 100%)',
  blobA: '#bfdbfe', blobB: '#bae6fd', blobC: '#dbeafe',
  navBg: 'rgba(255,255,255,0.88)',
  navBorder: 'rgba(59,130,246,0.15)',
  logoGrad: 'linear-gradient(135deg,#3b82f6,#2563eb)',
  brandText: '#0f2d5c',
  badgeBg: 'rgba(59,130,246,0.1)',
  badgeBorder: 'rgba(59,130,246,0.28)',
  badgeText: '#1d4ed8',
  h1Color: '#0f172a',
  h1Shadow: 'none',
  subText: '#475569',
  ctaPrimary: 'linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)',
  ctaPrimaryShadow: '0 4px 20px rgba(59,130,246,0.4)',
  ctaSecBg: 'rgba(59,130,246,0.07)',
  ctaSecBorder: 'rgba(59,130,246,0.25)',
  ctaSecText: '#1d4ed8',
  proofText: '#64748b',
  sectionLabel: '#2563eb',
  sectionH2: '#0f172a',
  sectionP: '#475569',
  cardBg: '#ffffff',
  cardBorder: 'rgba(59,130,246,0.12)',
  cardHoverBg: '#eff6ff',
  cardHoverBorder: 'rgba(59,130,246,0.4)',
  cardBaseShadow: '0 2px 12px rgba(59,130,246,0.07)',
  cardHoverShadow: '0 12px 40px rgba(59,130,246,0.14)',
  cardTitle: '#0f172a',
  cardDesc: '#475569',
  stepBg: '#ffffff',
  stepBorder: 'rgba(59,130,246,0.12)',
  stepBaseShadow: '0 2px 12px rgba(59,130,246,0.07)',
  stepNum: 'linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)',
  stepNumShadow: '0 4px 20px rgba(59,130,246,0.35)',
  stepTitle: '#0f172a',
  stepDesc: '#475569',
  ctaBoxBg: 'linear-gradient(135deg,rgba(59,130,246,0.09) 0%,rgba(37,99,235,0.05) 100%)',
  ctaBoxBorder: 'rgba(59,130,246,0.2)',
  ctaBoxShadow: '0 4px 40px rgba(59,130,246,0.1)',
  ctaH2: '#0f172a',
  ctaP: '#475569',
  footerBorder: 'rgba(59,130,246,0.12)',
  footerBrand: '#0f172a',
  footerCopy: '#94a3b8',
  footerLink: '#94a3b8',
  toggleBg: 'rgba(59,130,246,0.08)',
  toggleBorder: 'rgba(59,130,246,0.22)',
  toggleIcon: '#2563eb',
  gradStart: '#60a5fa',
  gradMid: '#3b82f6',
  gradEnd: '#2563eb',
  cursorColor: '#3b82f6',
} as const;

type Tokens = Record<string, string>;

const FEATURES = [
  { icon: <CalendarDays className="h-6 w-6" />, color: '#6366f1', title: 'Session Scheduling', desc: 'Visual calendar with month navigation, one-off and recurring sessions, and clash detection. Students always know when their next lesson is.' },
  { icon: <BarChart3 className="h-6 w-6" />, color: '#10b981', title: 'Student Progress', desc: 'Track working grades, target grades, and exam boards per subject. Students see their progress journey right in their portal.' },
  { icon: <BookOpen className="h-6 w-6" />, color: '#f59e0b', title: 'Assignments & Resources', desc: 'Set homework, attach files or links, and let students mark tasks as submitted. Keep everything organised by student and subject.' },
  { icon: <CreditCard className="h-6 w-6" />, color: '#ec4899', title: 'Stripe Invoicing', desc: 'Connect your Stripe account and issue payment links in seconds. Track paid and unpaid invoices without leaving the portal.' },
  { icon: <Users className="h-6 w-6" />, color: '#3b82f6', title: 'Student Roster', desc: 'Add students by email, specify levels (GCSE / A-Level), subjects, and exam boards. A structured roster that stays in sync automatically.' },
  { icon: <GraduationCap className="h-6 w-6" />, color: '#8b5cf6', title: 'Dual Portals', desc: 'Tutors get a full management dashboard. Students get a clean client view — same platform, separate experiences.' },
];

const STEPS = [
  { step: '01', title: 'Create your tutor account', desc: "Sign up, connect your Stripe account for payments, and you're ready to go." },
  { step: '02', title: 'Add your students', desc: "Enter each student's email, subject, level, and exam board to build your roster." },
  { step: '03', title: 'Book & manage sessions', desc: 'Schedule recurring or one-off lessons and let your students view everything in their own portal.' },
];

const PROOF = [
  { icon: <Users className="h-4 w-4 text-indigo-500" />, label: 'Tutor & student accounts' },
  { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, label: 'No setup fees' },
  { icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, label: 'Stripe payments built in' },
];

// ─── Isolated cursor: blink interval only re-renders this tiny node ───────────

function BlinkingCursor() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setOn((v) => !v), 530);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="typed-cursor" style={{ opacity: on ? 1 : 0, transition: 'opacity 0.1s' }} />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LandingPageClient() {
  const [dark, setDark] = useState(false);

  // Typewriter — cursorOn state lives in BlinkingCursor, not here
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    if (!deleting) {
      if (typed.length < TYPED_WORD.length) {
        id = setTimeout(() => setTyped(TYPED_WORD.slice(0, typed.length + 1)), 110);
      } else {
        id = setTimeout(() => setDeleting(true), 2200);
      }
    } else {
      if (typed.length > 0) {
        id = setTimeout(() => setTyped(typed.slice(0, -1)), 65);
      } else {
        id = setTimeout(() => setDeleting(false), 400);
      }
    }
    return () => clearTimeout(id);
  }, [typed, deleting]);

  // Pure reference swap — O(1), no allocation, no useMemo needed
  const t: Tokens = dark ? DARK : LIGHT;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blob {
          0%,100% { transform: translate(0,0) scale(1); }
          33%     { transform: translate(30px,-50px) scale(1.1); }
          66%     { transform: translate(-20px,20px) scale(0.95); }
        }
        .fade-up-1 { animation: fadeUp .65s ease both; }
        .fade-up-2 { animation: fadeUp .65s .1s  ease both; }
        .fade-up-3 { animation: fadeUp .65s .2s  ease both; }
        .fade-up-4 { animation: fadeUp .65s .3s  ease both; }
        .fade-up-5 { animation: fadeUp .65s .4s  ease both; }
        .blob-anim  { animation: blob 7s infinite ease-in-out; }
        .blob-d1    { animation-delay: 2.5s; }
        .blob-d2    { animation-delay: 5s; }
        /* Hover driven entirely by CSS custom props set on the grid wrapper */
        .feature-card {
          background:    var(--card-bg);
          border-color:  var(--card-border);
          box-shadow:    var(--card-base-shadow);
          transition: background .22s ease, border-color .22s ease,
                      transform .22s ease, box-shadow .22s ease;
        }
        .feature-card:hover {
          background:   var(--card-hover-bg);
          border-color: var(--card-hover-border);
          box-shadow:   var(--card-hover-shadow);
          transform:    translateY(-4px);
        }
        .toggle-btn   { transition: background .2s, border-color .2s, color .2s, transform .15s; }
        .toggle-btn:hover { transform: scale(1.08); }
        .cta-link     { transition: opacity .15s, transform .15s; }
        .cta-link:hover { opacity: .9; transform: translateY(-1px); }
        .page-transition { transition: background .35s ease; }
        .grad-text {
          background: linear-gradient(135deg, var(--grad-start) 0%, var(--grad-mid) 55%, var(--grad-end) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          display: inline;
        }
        .typed-cursor {
          display: inline-block;
          width: 3px;
          margin-left: 2px;
          border-radius: 2px;
          background: var(--cursor-color);
          vertical-align: baseline;
          height: 0.85em;
          position: relative;
          top: 0.05em;
        }
      `}</style>

      <div
        className="page-transition relative min-h-screen overflow-x-hidden"
        style={{
          background: t.pageBg,
          '--grad-start': t.gradStart,
          '--grad-mid': t.gradMid,
          '--grad-end': t.gradEnd,
          '--cursor-color': t.cursorColor,
        } as React.CSSProperties}
      >

        {/* Background blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="blob-anim absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full opacity-40"
            style={{ background: `radial-gradient(circle, ${t.blobA}, transparent 70%)` }} />
          <div className="blob-anim blob-d1 absolute top-1/3 -right-48 h-[480px] w-[480px] rounded-full opacity-30"
            style={{ background: `radial-gradient(circle, ${t.blobB}, transparent 70%)` }} />
          <div className="blob-anim blob-d2 absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full opacity-30"
            style={{ background: `radial-gradient(circle, ${t.blobC}, transparent 70%)` }} />
        </div>

        {/* ── NAV ── */}
        <header className="sticky top-0 z-30 border-b"
          style={{ background: t.navBg, borderColor: t.navBorder, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: t.logoGrad }}>
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight" style={{ color: t.brandText }}>TutorPortal</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button id="theme-toggle" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                onClick={() => setDark((d) => !d)}
                className="toggle-btn flex h-9 w-9 items-center justify-center rounded-xl border"
                style={{ background: t.toggleBg, borderColor: t.toggleBorder, color: t.toggleIcon }}>
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <Link href="/login" className="cta-link rounded-xl border px-4 py-2 text-sm font-medium"
                style={{ background: t.ctaSecBg, borderColor: t.ctaSecBorder, color: t.ctaSecText }}>
                <div className="flex items-center gap-1"><LogIn className="h-4 w-4" />Sign In</div>
              </Link>
              <Link href="/login?mode=signup" className="cta-link hidden rounded-xl px-4 py-2 text-sm font-semibold text-white sm:block"
                style={{ background: t.ctaPrimary, boxShadow: t.ctaPrimaryShadow }}>
                <div className="flex items-center gap-1"><CircleUserRound className="h-5 w-5 mb-0.5" />Get Started</div>
              </Link>
            </div>
          </div>
        </header>

        {/* ── HERO ── */}
        <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-20 text-center sm:pt-32">
          <div className="fade-up-1 mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2"
            style={{ background: t.badgeBg, border: `1px solid ${t.badgeBorder}` }}>
            <Sparkles className="h-4 w-4" style={{ color: t.badgeText }} />
            <span className="text-sm font-medium" style={{ color: t.badgeText }}>Built for independent tutors</span>
          </div>

          <h1 className="fade-up-2 text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
            style={{ color: t.h1Color, textShadow: t.h1Shadow }}>
            Smarter tutoring,{' '}
            <span className="grad-text">{typed}</span>
            <BlinkingCursor />
          </h1>

          <p className="fade-up-3 mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl" style={{ color: t.subText }}>
            Give your students a professional portal to track sessions, homework, and invoices —
            while you focus on what matters most: teaching.
          </p>

          <div className="fade-up-4 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/login?mode=signup" className="cta-link flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-semibold text-white"
              style={{ background: t.ctaPrimary, boxShadow: t.ctaPrimaryShadow }}>
              Start for free <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/login" className="cta-link flex items-center gap-2 rounded-2xl border px-8 py-4 text-base font-medium"
              style={{ background: t.ctaSecBg, borderColor: t.ctaSecBorder, color: t.ctaSecText }}>
              Sign in to your portal <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="fade-up-5 mt-12 flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: t.proofText }}>
            {PROOF.map((item) => (
              <span key={item.label} className="flex items-center gap-1.5">
                {item.icon} {item.label}
              </span>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
          <div className="mb-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: t.sectionLabel }}>Everything you need</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl" style={{ color: t.sectionH2 }}>One portal. All the tools.</h2>
            <p className="mx-auto mt-3 max-w-xl" style={{ color: t.sectionP }}>
              Stop juggling spreadsheets, WhatsApp messages, and banking apps. TutorPortal brings it all under one roof.
            </p>
          </div>
          {/* CSS vars set once on the grid; .feature-card reads them — zero JS event handlers */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            style={{
              '--card-bg': t.cardBg,
              '--card-border': t.cardBorder,
              '--card-hover-bg': t.cardHoverBg,
              '--card-hover-border': t.cardHoverBorder,
              '--card-base-shadow': t.cardBaseShadow,
              '--card-hover-shadow': t.cardHoverShadow,
            } as React.CSSProperties}>
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card rounded-2xl border p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${f.color}1a`, color: f.color }}>
                  {f.icon}
                </div>
                <h3 className="mb-2 text-base font-semibold" style={{ color: t.cardTitle }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: t.cardDesc }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="relative z-10 mx-auto max-w-4xl px-6 py-20">
          <div className="mb-14 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: t.sectionLabel }}>Get up and running</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl" style={{ color: t.sectionH2 }}>Ready in minutes</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((item) => (
              <div key={item.step} className="rounded-2xl border p-6 text-center"
                style={{ background: t.stepBg, borderColor: t.stepBorder, boxShadow: t.stepBaseShadow }}>
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-black text-white"
                  style={{ background: t.stepNum, boxShadow: t.stepNumShadow }}>
                  {item.step}
                </div>
                <h3 className="mb-2 text-sm font-semibold" style={{ color: t.stepTitle }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: t.stepDesc }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="relative z-10 mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="rounded-3xl p-10 sm:p-14"
            style={{ background: t.ctaBoxBg, border: `1px solid ${t.ctaBoxBorder}`, boxShadow: t.ctaBoxShadow }}>
            <Sparkles className="mx-auto mb-4 h-8 w-8" style={{ color: t.sectionLabel }} />
            <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: t.ctaH2 }}>Ready to get started?</h2>
            <p className="mx-auto mt-4 max-w-md" style={{ color: t.ctaP }}>
              Create your free tutor account today and give your students the professional experience they deserve.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/login?mode=signup" className="cta-link flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-semibold text-white"
                style={{ background: t.ctaPrimary, boxShadow: t.ctaPrimaryShadow }}>
                Create free account <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/login" className="cta-link flex items-center gap-2 rounded-2xl border px-8 py-4 text-base font-medium"
                style={{ background: t.ctaSecBg, borderColor: t.ctaSecBorder, color: t.ctaSecText }}>
                Sign in <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="relative z-10 border-t px-6 py-8" style={{ borderColor: t.footerBorder }}>
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: t.logoGrad }}>
                <GraduationCap className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold" style={{ color: t.footerBrand }}>TutorPortal</span>
            </div>
            <p className="text-xs" style={{ color: t.footerCopy }}>
              © {CURRENT_YEAR} TutorPortal. Built for tutors, by tutors.
            </p>
            <div className="flex gap-4 text-xs" style={{ color: t.footerLink }}>
              <Link href="/login" className="transition hover:opacity-70">Sign In</Link>
              <Link href="/login?mode=signup" className="transition hover:opacity-70">Sign Up</Link>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
