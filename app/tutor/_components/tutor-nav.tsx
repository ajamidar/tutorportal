'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/tutor/dashboard', label: 'Dashboard' },
  { href: '/tutor/students', label: 'My Students' },
  { href: '/tutor/schedule', label: 'Schedule' },
  { href: '/tutor/billing', label: 'Billing' },
];

export function TutorNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-lg px-3 py-2 text-sm font-medium transition',
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
