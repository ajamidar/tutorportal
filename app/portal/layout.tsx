import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { signOutClientAction } from './actions';
import { PortalNav } from './_components/portal-nav';
import { LogInIcon } from 'lucide-react';

export default function PortalLayout({ children }: { children: ReactNode }) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-sky-100/80 via-rose-50/90 to-sky-100/90">
      {/* Desktop sidebar */}
      <aside className="hidden sm:flex sm:w-56 sm:flex-col sm:fixed sm:inset-y-0 sm:left-0 sm:z-30 sm:border-r sm:border-slate-200 sm:bg-white">
        <div className="flex flex-col h-full px-4 py-5 gap-6">
          {/* Logo */}
          <div className="shrink-0 px-1">
            <Link href="/portal/dashboard" aria-label="Go to portal home">
              <Image
                src="/tutorflow.png"
                alt="TutorFlow"
                width={520}
                height={130}
                className="h-9 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1">
            <PortalNav mobile={false} />
          </div>

          {/* Sign Out */}
          <form action={signOutClientAction} className="mt-auto">
            <Button
              type="submit"
              variant="outline"
              className="w-full h-9 rounded-xl px-3 text-xs sm:text-sm bg-red-500 border-red-600 hover:border-red-600 shadow-sm shadow-red-700 text-white hover:bg-red-400 hover:text-white"
            >
              <LogInIcon className="h-4 w-4 mr-1" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col sm:pl-56">
        <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-24 pt-5 sm:px-6 sm:pb-6">
          {children}
        </main>

        <footer className="border-t border-slate-200/80 bg-white/90 pb-20 pt-5 text-xs text-slate-600 sm:pb-5 sm:text-sm">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-between gap-1 px-4 text-center sm:flex-row sm:gap-2 sm:px-6 sm:text-left">
            <p>© {currentYear} TutorFlow. All rights reserved.</p>
            <p>Secure payments and lesson records for families and tutors.</p>
          </div>
        </footer>
      </div>

      {/* Mobile bottom nav */}
      <div className="sm:hidden">
        <PortalNav mobile />
      </div>
    </div>
  );
}
