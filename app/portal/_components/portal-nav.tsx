'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpenCheck, CreditCard, House } from 'lucide-react';
import { cn } from '@/lib/utils';

type PortalNavProps = {
  mobile?: boolean;
};

const navItems = [
  {
    href: '/portal/dashboard',
    label: 'Home',
    icon: House,
  },
  {
    href: '/portal/assignments',
    label: 'Homework',
    icon: BookOpenCheck,
  },
  {
    href: '/portal/billing',
    label: 'Billing',
    icon: CreditCard,
  },
];

export function PortalNav({ mobile = false }: PortalNavProps) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.4rem)] pt-2 backdrop-blur-xl">
        <ul className="mx-auto grid w-full max-w-md grid-cols-3 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex min-h-14 flex-col items-center justify-center rounded-xl text-[11px] font-semibold tracking-wide transition-colors',
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="mb-1 h-4 w-4" />
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
    <nav aria-label="Portal navigation">
      <ul className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-slate-100/80 p-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-blue-500 border-blue-600 text-white shadow-md shadow-blue-700' : 'text-slate-600 hover:text-slate-900 border-slate-200 shadow-sm shadow-slate-300 hover:bg-slate-200'
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