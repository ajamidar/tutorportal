'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/tutor/dashboard', label: 'Dashboard' },
  { href: '/tutor/students', label: 'My Students' },
  { href: '/tutor/schedule', label: 'Schedule' },
  { href: '/tutor/billing', label: 'Billing' },
  { href: '/tutor/profile', label: 'Profile' },
];

export function TutorNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <div key={item.href} className='px-1 py-1.5 bg-slate-100 rounded-2xl hover:scale-105 transition'>
            <Link
              href={item.href}
              className={cn(
                'rounded-2xl px-3 py-2 text-sm font-medium  shadow-sm shadow-slate-500 ',
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500'
                  : 'border border-slate-200 bg-[#ffffffd5] text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 '
              )}
            >
              {item.label}
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
