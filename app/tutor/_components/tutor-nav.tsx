'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpenCheck, CalendarDays, CreditCard, LayoutDashboard, UserCircle2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

type TutorNavProps = {
  mobile?: boolean;
};

const navItems = [
  { href: '/tutor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tutor/students', label: 'Students', icon: Users },
  { href: '/tutor/schedule', label: 'Schedule', icon: CalendarDays },
  { href: '/tutor/assignments', label: 'Assignments', icon: BookOpenCheck },
  { href: '/tutor/billing', label: 'Billing', icon: CreditCard },
  { href: '/tutor/profile', label: 'Profile', icon: UserCircle2 },
];

export function TutorNav({ mobile = false }: TutorNavProps) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.25rem)] pt-1.5 backdrop-blur-xl">
        <ul className="mx-auto grid w-full max-w-md grid-cols-3 gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex min-h-12 flex-col items-center justify-center rounded-lg text-[10px] font-semibold tracking-wide transition-colors',
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="mb-0.5 h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label="Tutor navigation">
      <ul className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-100/80 p-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-500'
                    : 'border border-slate-200 bg-white/90 text-slate-700 shadow-sm shadow-slate-300 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
