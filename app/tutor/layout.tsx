import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TutorNav } from './_components/tutor-nav';
import { signOutTutorAction } from './actions';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import { LogOut } from 'lucide-react';

export default function TutorLayout({ children }: { children: ReactNode }) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex min-h-screen bg-transparent">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:fixed md:inset-y-0 md:left-0 md:z-30 md:border-r md:border-slate-200 md:bg-white">
        <div className="flex flex-col h-full px-4 py-5 gap-6">
          {/* Logo */}
          <div className="shrink-0 px-1">
            <Link href="/tutor/dashboard" aria-label="Go to tutor home">
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
            <TutorNav />
          </div>

          {/* Sign Out */}
          <form action={signOutTutorAction} className="mt-auto">
            <Button
              type="submit"
              variant="outline"
              className="w-full bg-red-500 text-white hover:bg-red-600 hover:text-white rounded-xl shadow-md shadow-red-200 hover:shadow-red-300"
            >
              <LogOut className="mr-1 h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col md:pl-56">
        {/* Mobile header with logo and sign out */}
        <header className="md:hidden sticky top-0 z-30 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/tutor/dashboard" aria-label="Go to tutor home">
              <Image
                src="/tutorflow.png"
                alt="TutorFlow"
                width={520}
                height={130}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <form action={signOutTutorAction}>
              <Button type="submit" variant="outline" className="bg-red-500 text-white hover:bg-red-600 hover:text-white rounded-2xl">
                <LogOut className="mr-0.5 h-4 w-4" />Sign Out
              </Button>
            </form>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-5 sm:px-6 md:pb-6">
          {children}
        </main>

        <footer className="border-t border-slate-200/80 bg-white/90 pb-20 pt-5 text-xs text-slate-600 sm:pb-5 sm:text-sm">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-1 px-4 text-center sm:flex-row sm:gap-2 sm:px-6 sm:text-left">
            <p>© {currentYear} TutorFlow. All rights reserved.</p>
            <p>Built for independent tutors to manage lessons, students, and billing.</p>
          </div>
        </footer>
      </div>

      {/* Mobile bottom nav */}
      <div className="md:hidden">
        <TutorNav mobile />
      </div>

      <Toaster richColors position="top-right" />
    </div>
  );
}
