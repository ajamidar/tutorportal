'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import { BlinkingCursor } from './BlinkingCursor';
import { TYPED_WORD, PROOF } from './data';
import type { Tokens } from './tokens';

interface Props {
  t: Tokens;
  dark: boolean;
}

/**
 * Full-viewport hero with photo background.
 * Owns the typewriter animation state — changes here never re-render other sections.
 * To swap the hero image, replace /public/hero-bg.jpg.
 */
export function HeroSection({ t, dark }: Props) {
  const [typed,    setTyped]    = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    if (!deleting) {
      if (typed.length < TYPED_WORD.length) id = setTimeout(() => setTyped(TYPED_WORD.slice(0, typed.length + 1)), 110);
      else                                   id = setTimeout(() => setDeleting(true), 2200);
    } else {
      if (typed.length > 0) id = setTimeout(() => setTyped(typed.slice(0, -1)), 65);
      else                   id = setTimeout(() => setDeleting(false), 400);
    }
    return () => clearTimeout(id);
  }, [typed, deleting]);

  return (
    <section className="relative overflow-hidden" style={{ minHeight: '88vh' }}>
      {/* Background photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero-bg.jpg"
        alt="Tutor working with a student"
        className="absolute inset-0 h-full w-full object-cover object-top"
      />

      {/* Dark overlay — lightness adjusts per theme */}
      <div
        className="absolute inset-0"
        style={{
          background: dark
            ? 'linear-gradient(155deg, rgba(68,81,135,0.88) 0%, rgba(10,20,60,0.80) 55%, rgba(34,46,94,0.85) 100%)'
            : 'linear-gradient(155deg, rgba(85,100,145,0.8) 0%, rgba(37,68,147,0.72) 55%, rgba(67,81,123,0.78) 100%)',
        }}
      />

      {/* Content — always white text; overlay ensures legibility in both themes */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-20 text-center sm:pt-32">
        <div
          className="fade-up-1 mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2"
          style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.32)' }}
        >
          <Sparkles className="h-4 w-4 text-blue-300" />
          <span className="text-sm font-medium text-white">Built for independent tutors</span>
        </div>

        <h1
          className="fade-up-2 text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl"
          style={{ textShadow: '0 2px 28px rgba(0,0,0,0.45)' }}
        >
          Smarter tutoring,{' '}
          <span className="grad-text">{typed}</span>
          <BlinkingCursor />
        </h1>

        <p
          className="fade-up-3 mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl"
          style={{ color: 'rgba(255,255,255,0.82)' }}
        >
          Give your students a professional portal to track sessions, homework, and invoices —
          while you focus on what matters most: teaching.
        </p>

        <div className="fade-up-4 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login?mode=signup"
            className="cta-link flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-semibold text-white"
            style={{ background: 'linear-gradient(135deg,#3b82f6 0%,#2563eb 100%)', boxShadow: '0 4px 24px rgba(59,130,246,0.55)' }}
          >
            Start for free <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/login"
            className="cta-link flex items-center gap-2 rounded-2xl border px-8 py-4 text-base font-medium text-white"
            style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.38)' }}
          >
            Sign in to your portal <ChevronRight className="h-5 w-5" />
          </Link>
        </div>

        <div
          className="fade-up-5 mt-12 flex flex-wrap items-center justify-center gap-6 text-sm"
          style={{ color: 'rgba(255,255,255,0.70)' }}
        >
          {PROOF.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5">
              <item.Icon className={`h-4 w-4 ${item.iconClass}`} /> {item.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
