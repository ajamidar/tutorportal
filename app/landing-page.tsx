'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarDays, BookOpen, CreditCard, ChevronRight, GraduationCap,
  Users, BarChart3, CheckCircle2, Sparkles, ArrowRight, Moon, Sun,
  LogIn, CircleUserRound, MessageSquare, FileText, AlertCircle, HelpCircle,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const TYPED_WORD   = 'simplified.';
const CURRENT_YEAR = new Date().getFullYear();

const DARK = {
  pageBg: 'linear-gradient(135deg, #0f0f1a 0%, #12122a 40%, #0d1a2e 100%)',
  blobA: '#6366f1', blobB: '#3b82f6', blobC: '#8b5cf6',
  navBg: 'rgba(15,15,26,0.85)', navBorder: 'rgba(255,255,255,0.08)',
  logoGrad: 'linear-gradient(135deg,#6366f1,#4f46e5)',
  brandText: '#ffffff',
  badgeBg: 'rgba(99,102,241,0.18)', badgeBorder: 'rgba(99,102,241,0.35)', badgeText: '#a5b4fc',
  h1Color: '#ffffff', h1Shadow: '0 0 80px rgba(99,102,241,0.3)',
  subText: '#94a3b8',
  ctaPrimary: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)',
  ctaPrimaryShadow: '0 4px 24px rgba(99,102,241,0.4)',
  ctaSecBg: 'rgba(255,255,255,0.08)', ctaSecBorder: 'rgba(255,255,255,0.18)', ctaSecText: '#ffffff',
  proofText: '#94a3b8',
  sectionLabel: '#818cf8', sectionH2: '#ffffff', sectionP: '#94a3b8',
  cardBg: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(255,255,255,0.09)',
  cardHoverBg: 'rgba(255,255,255,0.1)', cardHoverBorder: 'rgba(99,102,241,0.4)',
  cardBaseShadow: 'none', cardHoverShadow: '0 20px 60px rgba(99,102,241,0.15)',
  cardTitle: '#ffffff', cardDesc: '#94a3b8',
  stepNum: 'linear-gradient(135deg,#6366f1 0%,#4f46e5 100%)',
  stepNumShadow: '0 4px 20px rgba(99,102,241,0.4)',
  stepTitle: '#ffffff', stepDesc: '#94a3b8', stepLine: 'rgba(99,102,241,0.25)',
  ctaBoxBg: 'linear-gradient(135deg,rgba(99,102,241,0.18) 0%,rgba(79,70,229,0.12) 100%)',
  ctaBoxBorder: 'rgba(99,102,241,0.3)', ctaBoxShadow: '0 0 80px rgba(99,102,241,0.12)',
  ctaH2: '#ffffff', ctaP: '#cbd5e1',
  footerBorder: 'rgba(255,255,255,0.08)', footerBrand: '#ffffff',
  footerCopy: '#475569', footerLink: '#475569',
  toggleBg: 'rgba(255,255,255,0.08)', toggleBorder: 'rgba(255,255,255,0.15)', toggleIcon: '#fbbf24',
  gradStart: '#818cf8', gradMid: '#6366f1', gradEnd: '#4f46e5', cursorColor: '#6366f1',
  painBg: 'rgba(0,0,0,0.2)', painCardBg: 'rgba(239,68,68,0.07)', painCardBorder: 'rgba(239,68,68,0.18)',
  painText: '#94a3b8', painHeadline: '#ffffff',
  statsBg: 'rgba(99,102,241,0.1)', statsBorder: 'rgba(99,102,241,0.2)', statsNum: '#ffffff', statsLabel: '#94a3b8',
  quoteBg: 'rgba(255,255,255,0.04)', quoteBorder: 'rgba(99,102,241,0.25)',
  quoteText: '#e2e8f0', quoteAuthor: '#818cf8', quoteRole: '#64748b',
  checkBg: 'rgba(99,102,241,0.12)', checkBorder: 'rgba(99,102,241,0.3)', checkIcon: '#818cf8', checkText: '#cbd5e1',
} as const;

const LIGHT = {
  pageBg: 'linear-gradient(160deg, #f0f7ff 0%, #dbeafe 35%, #f0f9ff 100%)',
  blobA: '#bfdbfe', blobB: '#bae6fd', blobC: '#dbeafe',
  navBg: 'rgba(255,255,255,0.88)', navBorder: 'rgba(59,130,246,0.15)',
  logoGrad: 'linear-gradient(135deg,#3b82f6,#2563eb)',
  brandText: '#0f2d5c',
  badgeBg: 'rgba(59,130,246,0.1)', badgeBorder: 'rgba(59,130,246,0.28)', badgeText: '#1d4ed8',
  h1Color: '#0f172a', h1Shadow: 'none',
  subText: '#475569',
  ctaPrimary: 'linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)',
  ctaPrimaryShadow: '0 4px 20px rgba(59,130,246,0.4)',
  ctaSecBg: 'rgba(59,130,246,0.07)', ctaSecBorder: 'rgba(59,130,246,0.25)', ctaSecText: '#1d4ed8',
  proofText: '#64748b',
  sectionLabel: '#2563eb', sectionH2: '#0f172a', sectionP: '#475569',
  cardBg: '#ffffff', cardBorder: 'rgba(59,130,246,0.12)',
  cardHoverBg: '#eff6ff', cardHoverBorder: 'rgba(59,130,246,0.4)',
  cardBaseShadow: '0 2px 12px rgba(59,130,246,0.07)', cardHoverShadow: '0 12px 40px rgba(59,130,246,0.14)',
  cardTitle: '#0f172a', cardDesc: '#475569',
  stepNum: 'linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)',
  stepNumShadow: '0 4px 20px rgba(59,130,246,0.35)',
  stepTitle: '#0f172a', stepDesc: '#475569', stepLine: 'rgba(59,130,246,0.2)',
  ctaBoxBg: 'linear-gradient(135deg,rgba(59,130,246,0.09) 0%,rgba(37,99,235,0.05) 100%)',
  ctaBoxBorder: 'rgba(59,130,246,0.2)', ctaBoxShadow: '0 4px 40px rgba(59,130,246,0.1)',
  ctaH2: '#0f172a', ctaP: '#475569',
  footerBorder: 'rgba(59,130,246,0.12)', footerBrand: '#0f172a',
  footerCopy: '#94a3b8', footerLink: '#94a3b8',
  toggleBg: 'rgba(59,130,246,0.08)', toggleBorder: 'rgba(59,130,246,0.22)', toggleIcon: '#2563eb',
  gradStart: '#bfdbfe', gradMid: '#93c5fd', gradEnd: '#60a5fa', cursorColor: '#93c5fd',
  painBg: 'rgba(254,242,242,0.45)', painCardBg: '#fff7f5', painCardBorder: 'rgba(239,68,68,0.15)',
  painText: '#475569', painHeadline: '#0f172a',
  statsBg: 'rgba(59,130,246,0.07)', statsBorder: 'rgba(59,130,246,0.15)', statsNum: '#0f172a', statsLabel: '#475569',
  quoteBg: '#f8fafe', quoteBorder: 'rgba(59,130,246,0.15)',
  quoteText: '#1e293b', quoteAuthor: '#1d4ed8', quoteRole: '#64748b',
  checkBg: 'rgba(59,130,246,0.08)', checkBorder: 'rgba(59,130,246,0.2)', checkIcon: '#2563eb', checkText: '#374151',
} as const;

type Tokens = Record<string, string>;

const PAIN_POINTS = [
  { icon: <MessageSquare className="h-6 w-6" />, color: '#ef4444', title: 'Scheduling by DM', desc: 'Confirming one session takes 10 back-and-forth messages across WhatsApp, texts, and emails.' },
  { icon: <FileText      className="h-6 w-6" />, color: '#f97316', title: 'Spreadsheet chaos',  desc: 'Grades, subjects, and exam boards scattered across sheets that are always out of date.' },
  { icon: <AlertCircle  className="h-6 w-6" />, color: '#f59e0b', title: 'Chasing payments',   desc: 'Following up on bank transfers is awkward, time-consuming — and some never arrive.' },
  { icon: <HelpCircle   className="h-6 w-6" />, color: '#ec4899', title: 'Students in the dark', desc: "Students have no idea what homework is due, when sessions are, or how they're progressing." },
];

const STATS = [
  { value: '2+',  label: 'hours saved on admin each week' },
  { value: '20+', label: 'students managed per tutor' },
  { value: '£0',  label: 'in uncollected payments' },
  { value: '1',   label: 'platform replaces 5 tools' },
];

const FEATURES = [
  { icon: <CalendarDays  className="h-6 w-6" />, color: '#6366f1', solves: 'Scheduling chaos',    title: 'Session Scheduling',     desc: 'Visual calendar with one-off and recurring sessions. No more back-and-forth — students always know when their next lesson is.' },
  { icon: <BarChart3     className="h-6 w-6" />, color: '#10b981', solves: 'Manual grade tracking', title: 'Student Progress',        desc: 'Track working grades, target grades, and exam boards per subject. Students see their progress journey in real time.' },
  { icon: <BookOpen      className="h-6 w-6" />, color: '#f59e0b', solves: 'Homework confusion',    title: 'Assignments & Resources', desc: 'Set homework, attach files or links, let students mark tasks submitted. Everything organised in one place.' },
  { icon: <CreditCard    className="h-6 w-6" />, color: '#ec4899', solves: 'Chasing payments',      title: 'Stripe Invoicing',        desc: 'Issue payment links in seconds. Track paid and unpaid invoices automatically — no more awkward payment follow-ups.' },
  { icon: <Users         className="h-6 w-6" />, color: '#3b82f6', solves: 'Scattered student info', title: 'Student Roster',         desc: 'Add students by email with subjects, levels, and exam boards. A structured roster that stays in sync.' },
  { icon: <GraduationCap className="h-6 w-6" />, color: '#8b5cf6', solves: 'Student confusion',     title: 'Dual Portals',           desc: 'Tutors get a full management dashboard. Students get a clean client view — same platform, two tailored experiences.' },
];

const STEPS = [
  { step: '01', title: 'Create your tutor account', desc: "Sign up in under a minute. Connect your Stripe account for payments and you're ready to go." },
  { step: '02', title: 'Add your students',          desc: "Enter each student's email, subjects, level, and exam board. They receive their login automatically." },
  { step: '03', title: 'Book & manage sessions',     desc: 'Schedule recurring or one-off lessons. Students see everything — sessions, homework, grades — in their portal.' },
];

const CTA_PERKS = [
  'Unlimited session scheduling',
  'Student progress tracking',
  'Stripe payment links',
  'Client portal for every student',
  'No credit card required to start',
];

const PROOF = [
  { icon: <Users        className="h-4 w-4 text-indigo-400" />, label: 'Tutor & student accounts' },
  { icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />, label: 'No setup fees' },
  { icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />, label: 'Stripe payments built in' },
];

const REVIEWS = [
  { name: 'Jamie R.',   role: 'GCSE Maths & Science, London',            stars: 5, text: 'Before TutorPortal I was sending 15 WhatsApp messages just to confirm one session. Now everything is just there — sessions, homework, grades.' },
  { name: 'Priya S.',  role: 'A-Level Biology, Manchester',              stars: 5, text: 'The Stripe integration alone saved me hours of awkward payment chasing. My students pay the moment I send the link.' },
  { name: 'Tom W.',    role: 'Primary & KS3 English, Bristol',           stars: 5, text: 'My students love their portal. They check homework and upcoming sessions without me having to remind them every time.' },
  { name: 'Aisha K.',  role: 'GCSE French & Spanish, Leeds',             stars: 5, text: 'I manage 18 students across 3 schools. TutorPortal keeps it all in one place — I genuinely don\'t know how I coped before.' },
  { name: 'Daniel M.', role: 'A-Level Maths & Further Maths, Edinburgh', stars: 5, text: 'Parents love seeing a proper grade breakdown rather than just a WhatsApp update. It\'s built real trust with my clients.' },
  { name: 'Sophie L.', role: 'GCSE Chemistry, Birmingham',               stars: 5, text: 'Setup took less than 10 minutes. I added all my students, scheduled 4 weeks of sessions, and sent payment links the same evening.' },
  { name: 'Marcus T.', role: 'KS2 & KS3 Maths, Oxford',                 stars: 5, text: 'My tutoring feels genuinely professional now. Students and parents can see everything they need — it\'s built real trust.' },
];

// ─── Isolated cursor component ────────────────────────────────────────────────
function BlinkingCursor() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setOn((v) => !v), 530);
    return () => clearInterval(id);
  }, []);
  return <span className="typed-cursor" style={{ opacity: on ? 1 : 0, transition: 'opacity 0.1s' }} />;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function LandingPageClient() {
  const [dark, setDark] = useState(false);
  const [typed,    setTyped]    = useState('');
  const [deleting, setDeleting] = useState(false);

  // Typewriter
  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    if (!deleting) {
      if (typed.length < TYPED_WORD.length) id = setTimeout(() => setTyped(TYPED_WORD.slice(0, typed.length + 1)), 110);
      else id = setTimeout(() => setDeleting(true), 2200);
    } else {
      if (typed.length > 0) id = setTimeout(() => setTyped(typed.slice(0, -1)), 65);
      else id = setTimeout(() => setDeleting(false), 400);
    }
    return () => clearTimeout(id);
  }, [typed, deleting]);

  // Scroll-reveal: single observer watches all [data-animate] elements
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-animate]');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } }),
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const t: Tokens = dark ? DARK : LIGHT;

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes blob {
          0%,100% { transform:translate(0,0) scale(1); }
          33%     { transform:translate(30px,-50px) scale(1.1); }
          66%     { transform:translate(-20px,20px) scale(0.95); }
        }
        @keyframes pulse-ring {
          0%   { transform:scale(1);   opacity:.6; }
          100% { transform:scale(1.5); opacity:0;  }
        }
        .fade-up-1{animation:fadeUp .65s ease both;}
        .fade-up-2{animation:fadeUp .65s .1s ease both;}
        .fade-up-3{animation:fadeUp .65s .2s ease both;}
        .fade-up-4{animation:fadeUp .65s .3s ease both;}
        .fade-up-5{animation:fadeUp .65s .4s ease both;}
        .blob-anim{animation:blob 7s infinite ease-in-out;}
        .blob-d1{animation-delay:2.5s;}
        .blob-d2{animation-delay:5s;}

        /* Scroll-reveal */
        [data-animate]{opacity:0;transform:translateY(30px);transition:opacity .6s ease,transform .6s ease;}
        [data-animate].in-view{opacity:1;transform:none;}
        [data-animate][data-dir="left"]{transform:translateX(-30px);}
        [data-animate][data-dir="right"]{transform:translateX(30px);}
        [data-animate][data-dir="left"].in-view,[data-animate][data-dir="right"].in-view{transform:none;}
        [data-delay="1"]{transition-delay:.08s;}
        [data-delay="2"]{transition-delay:.16s;}
        [data-delay="3"]{transition-delay:.24s;}
        [data-delay="4"]{transition-delay:.32s;}
        [data-delay="5"]{transition-delay:.40s;}
        [data-delay="6"]{transition-delay:.48s;}

        /* Feature cards */
        .feature-card{
          background:var(--card-bg);border-color:var(--card-border);box-shadow:var(--card-base-shadow);
          transition:background .22s,border-color .22s,transform .22s,box-shadow .22s;
        }
        .feature-card:hover{background:var(--card-hover-bg);border-color:var(--card-hover-border);box-shadow:var(--card-hover-shadow);transform:translateY(-4px);}

        /* Pain cards */
        .pain-card{transition:transform .22s,box-shadow .22s;}
        .pain-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(239,68,68,0.12);}

        .toggle-btn{transition:background .2s,border-color .2s,color .2s,transform .15s;}
        .toggle-btn:hover{transform:scale(1.08);}
        .cta-link{transition:opacity .15s,transform .15s;}
        .cta-link:hover{opacity:.9;transform:translateY(-1px);}
        .page-transition{transition:background .35s ease;}

        .grad-text{
          background:linear-gradient(135deg,var(--grad-start) 0%,var(--grad-mid) 55%,var(--grad-end) 100%);
          -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;display:inline;
        }
        .typed-cursor{
          display:inline-block;width:3px;margin-left:2px;border-radius:2px;
          background:var(--cursor-color);vertical-align:baseline;height:.85em;position:relative;top:.05em;
        }

        /* Stat pulse ring */
        .stat-ring{
          position:relative;display:inline-flex;align-items:center;justify-content:center;
        }
        .stat-ring::before{
          content:'';position:absolute;inset:-8px;border-radius:50%;
          border:1px solid currentColor;opacity:.25;
          animation:pulse-ring 2.4s ease-out infinite;
        }

        /* Infinite review marquee */
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 40s linear infinite;
        }
        .marquee-track:hover { animation-play-state: paused; }
        .review-card  { transition: transform .2s, box-shadow .2s; }
        .review-card:hover { transform: translateY(-3px); }
      `}</style>

      <div
        className="page-transition relative min-h-screen overflow-x-hidden"
        style={{
          background: t.pageBg,
          '--grad-start':   t.gradStart,
          '--grad-mid':     t.gradMid,
          '--grad-end':     t.gradEnd,
          '--cursor-color': t.cursorColor,
        } as React.CSSProperties}
      >
        {/* Background blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="blob-anim absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full opacity-30"
            style={{ background: `radial-gradient(circle,${t.blobA},transparent 70%)` }} />
          <div className="blob-anim blob-d1 absolute top-1/3 -right-48 h-[480px] w-[480px] rounded-full opacity-20"
            style={{ background: `radial-gradient(circle,${t.blobB},transparent 70%)` }} />
          <div className="blob-anim blob-d2 absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full opacity-20"
            style={{ background: `radial-gradient(circle,${t.blobC},transparent 70%)` }} />
        </div>

        {/* ── NAV ── */}
        <header className="sticky top-0 z-30 border-b"
          style={{ background: t.navBg, borderColor: t.navBorder, backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)' }}>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: t.logoGrad }}>
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight" style={{ color: t.brandText }}>TutorPortal</span>
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

        {/* ── HERO (image) ── */}
        <section className="relative overflow-hidden" style={{ minHeight: '88vh' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/hero-bg.jpg" alt="Tutor working with a student"
            className="absolute inset-0 h-full w-full object-cover object-top" />
          <div className="absolute inset-0" style={{
            background: dark
              ? 'linear-gradient(155deg, rgba(68,81,135,0.88) 0%, rgba(10,20,60,0.80) 55%, rgba(34,46,94,0.85) 100%)'
              : 'linear-gradient(155deg, rgba(85,100,145,0.8) 0%, rgba(37,68,147,0.72) 55%, rgba(67,81,123,0.78) 100%)',
          }} />
          <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-20 text-center sm:pt-32">
            <div className="fade-up-1 mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2"
              style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.32)' }}>
              <Sparkles className="h-4 w-4 text-blue-300" />
              <span className="text-sm font-medium text-white">Built for independent tutors</span>
            </div>
            <h1 className="fade-up-2 text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl"
              style={{ textShadow: '0 2px 28px rgba(0,0,0,0.45)' }}>
              Smarter tutoring,{' '}
              <span className="grad-text">{typed}</span>
              <BlinkingCursor />
            </h1>
            <p className="fade-up-3 mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl"
              style={{ color: 'rgba(255,255,255,0.82)' }}>
              Give your students a professional portal to track sessions, homework, and invoices —
              while you focus on what matters most: teaching.
            </p>
            <div className="fade-up-4 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/login?mode=signup" className="cta-link flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)', boxShadow: '0 4px 24px rgba(59,130,246,0.55)' }}>
                Start for free <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/login" className="cta-link flex items-center gap-2 rounded-2xl border px-8 py-4 text-base font-medium text-white"
                style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.38)' }}>
                Sign in to your portal <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="fade-up-5 mt-12 flex flex-wrap items-center justify-center gap-6 text-sm"
              style={{ color: 'rgba(255,255,255,0.70)' }}>
              {PROOF.map((item) => (
                <span key={item.label} className="flex items-center gap-1.5">{item.icon} {item.label}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── PAIN ── */}
        <section className="relative z-10 px-6 py-20" style={{ background: t.painBg }}>
          <div className="mx-auto max-w-5xl">
            <div className="mb-3 text-center" data-animate>
              <span className="inline-block rounded-full border px-4 py-1 text-xs font-bold uppercase tracking-widest"
                style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.25)', color: '#ef4444' }}>
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
                <div key={p.title} data-animate data-delay={String(i + 1)}
                  className="pain-card flex gap-5 rounded-2xl border p-6"
                  style={{ background: t.painCardBg, borderColor: t.painCardBorder }}>
                  <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${p.color}18`, color: p.color }}>
                    {p.icon}
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
                TutorPortal handles all of it.
              </p>
              <p className="mt-2" style={{ color: t.painText }}>One platform. Every tool your tutoring business needs.</p>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="relative z-10 border-y px-6 py-12"
          style={{ background: t.statsBg, borderColor: t.statsBorder }}>
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <div key={s.label} data-animate data-delay={String(i + 1)} className="text-center">
                <p className="text-4xl font-extrabold sm:text-5xl" style={{ color: t.statsNum }}>{s.value}</p>
                <p className="mt-1.5 text-xs leading-snug" style={{ color: t.statsLabel }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
          <div className="mb-14 text-center" data-animate>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: t.sectionLabel }}>Your solution</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl" style={{ color: t.sectionH2 }}>One portal. Every tool.</h2>
            <p className="mx-auto mt-3 max-w-xl" style={{ color: t.sectionP }}>
              Each feature directly fixes a real pain point — so you spend less time on admin and more time teaching.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            style={{
              '--card-bg': t.cardBg, '--card-border': t.cardBorder,
              '--card-hover-bg': t.cardHoverBg, '--card-hover-border': t.cardHoverBorder,
              '--card-base-shadow': t.cardBaseShadow, '--card-hover-shadow': t.cardHoverShadow,
            } as React.CSSProperties}>
            {FEATURES.map((f, i) => (
              <div key={f.title} data-animate data-delay={String((i % 3) + 1)} className="feature-card rounded-2xl border p-6">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${f.color}1a`, color: f.color }}>
                  {f.icon}
                </div>
                <div className="mb-3">
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{ background: `${f.color}15`, color: f.color }}>
                    Fixes: {f.solves}
                  </span>
                </div>
                <h3 className="mb-2 text-base font-semibold" style={{ color: t.cardTitle }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: t.cardDesc }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="relative z-10 px-6 py-20" style={{ background: t.painBg }}>
          <div className="mx-auto max-w-2xl">
            <div className="mb-14 text-center" data-animate>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: t.sectionLabel }}>Get up and running</p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl" style={{ color: t.sectionH2 }}>Ready in minutes</h2>
              <p className="mt-3" style={{ color: t.sectionP }}>No setup headaches. You can have your first session booked within the hour.</p>
            </div>
            {/* Timeline */}
            <div className="relative">
              {STEPS.map((item, i) => (
                <div key={item.step} data-animate data-delay={String(i + 1)}
                  className="relative flex gap-6 pb-10 last:pb-0">
                  {i < STEPS.length - 1 && (
                    <div className="absolute left-6 top-14 bottom-0 w-px" style={{ background: t.stepLine }} />
                  )}
                  <div className="relative shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl text-base font-black text-white"
                    style={{ background: t.stepNum, boxShadow: t.stepNumShadow }}>
                    {item.step}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="mb-1.5 font-semibold" style={{ color: t.stepTitle }}>{item.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: t.stepDesc }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── REVIEWS MARQUEE ── */}
        <section className="relative z-10 overflow-hidden py-16">
          <div className="mb-10 px-6 text-center" data-animate>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: t.sectionLabel }}>What tutors say</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl" style={{ color: t.sectionH2 }}>Trusted by tutors across the UK</h2>
          </div>
          {/* Edge-fade mask + infinite marquee */}
          <div
            className="relative overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
            }}
          >
            <div className="marquee-track gap-5 py-2">
              {[...REVIEWS, ...REVIEWS].map((r, i) => (
                <div
                  key={i}
                  className="review-card w-80 shrink-0 rounded-2xl border p-6"
                  style={{ background: t.quoteBg, borderColor: t.quoteBorder }}
                >
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: r.stars }).map((_, s) => (
                      <span key={s} className="text-sm text-amber-400">★</span>
                    ))}
                  </div>
                  <p className="mb-5 text-sm leading-relaxed" style={{ color: t.quoteText }}>"{r.text}"</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ background: t.stepNum }}
                    >
                      {r.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: t.quoteAuthor }}>{r.name}</p>
                      <p className="text-xs" style={{ color: t.quoteRole }}>{r.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="relative z-10 mx-auto max-w-3xl px-6 py-20 text-center">
          <div data-animate className="rounded-3xl p-10 sm:p-14"
            style={{ background: t.ctaBoxBg, border: `1px solid ${t.ctaBoxBorder}`, boxShadow: t.ctaBoxShadow }}>
            <Sparkles className="mx-auto mb-4 h-8 w-8" style={{ color: t.sectionLabel }} />
            <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: t.ctaH2 }}>Ready to take back your time?</h2>
            <p className="mx-auto mt-4 max-w-md" style={{ color: t.ctaP }}>
              Join tutors who've replaced their patchwork of tools with one clean, professional platform.
            </p>
            <div className="mx-auto mt-8 max-w-xs space-y-2 text-left">
              {CTA_PERKS.map((perk) => (
                <div key={perk} className="flex items-center gap-2.5 rounded-xl px-3 py-2"
                  style={{ background: t.checkBg, border: `1px solid ${t.checkBorder}` }}>
                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: t.checkIcon }} />
                  <span className="text-sm" style={{ color: t.checkText }}>{perk}</span>
                </div>
              ))}
            </div>
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
