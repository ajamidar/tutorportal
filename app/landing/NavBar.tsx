import Link from 'next/link';
import Image from 'next/image';
import { Moon, Sun, LogIn, CircleUserRound } from 'lucide-react';
import type { Tokens } from './tokens';

interface Props {
  t: Tokens;
  dark: boolean;
  onToggle: () => void;
}

export function NavBar({ t, dark, onToggle }: Props) {
  return (
    <header
      className="sticky top-0 z-30 border-b"
      style={{ background: t.navBg, borderColor: t.navBorder, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="#top" aria-label="Back to top" className="relative flex h-10 w-[160px] items-center rounded-xl bg-white/80 shadow-sm ring-1 ring-black/5 backdrop-blur-sm sm:h-11 sm:w-[180px]">
          <Image
            src={dark ? '/tutorflow-dark.png' : '/tutorflow.png'}
            alt="TutorFlow"
            width={500}
            height={160}
            className="h-full w-full"
          />
        </Link>

        {/* Nav actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="theme-toggle"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={onToggle}
            className="toggle-btn flex h-9 w-9 items-center justify-center rounded-xl border"
            style={{ background: t.toggleBg, borderColor: t.toggleBorder, color: t.toggleIcon }}
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            href="/login"
            className="cta-link rounded-xl border px-4 py-2 text-sm font-medium"
            style={{ background: t.ctaSecBg, borderColor: t.ctaSecBorder, color: t.ctaSecText }}
          >
            <div className="flex items-center gap-1"><LogIn className="h-4 w-4" />Sign In</div>
          </Link>
          <Link
            href="/login?mode=signup"
            className="cta-link hidden rounded-xl px-4 py-2 text-sm font-semibold text-white sm:block"
            style={{ background: t.ctaPrimary, boxShadow: t.ctaPrimaryShadow }}
          >
            <div className="flex items-center gap-1"><CircleUserRound className="h-5 w-5 mb-0.5" />Get Started</div>
          </Link>
        </div>
      </div>
    </header>
  );
}
