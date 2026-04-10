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
    <div className="flex min-h-screen flex-col bg-transparent">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-3">
            <div className="shrink-0">
              <Link href="/tutor/dashboard" aria-label="Go to tutor home">
                <Image
                  src="/tutorflow.png"
                  alt="TutorFlow"
                  width={520}
                  height={130}
                  className="h-10 w-auto object-contain sm:h-11"
                />
              </Link>
            </div>
            <form action={signOutTutorAction} className="md:hidden">
              <Button type="submit" variant="outline" className='bg-red-500 text-white hover:bg-red-600 hover:text-white rounded-2xl '>
                <LogOut className='mr-0.5 h-4 w-4'/>Sign Out
              </Button>
            </form>
          </div>
          <div className="hidden md:block">
            <TutorNav />
          </div>
          <form action={signOutTutorAction} className="hidden md:block">
            <Button type="submit" variant="outline" className='bg-red-500 text-white hover:bg-red-600 hover:text-white rounded-2xl'>
              <LogOut className='mr-1 h-5 w-5'/>Sign Out
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-5 sm:px-6 sm:pb-6 md:pb-6">{children}</main>
      <footer className="border-t border-slate-200/80 bg-white/90 pb-20 pt-5 text-xs text-slate-600 sm:pb-5 sm:text-sm">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-1 px-4 text-center sm:flex-row sm:gap-2 sm:px-6 sm:text-left">
          <p>© {currentYear} TutorFlow. All rights reserved.</p>
          <p>Built for independent tutors to manage lessons, students, and billing.</p>
        </div>
      </footer>
      <div className="md:hidden">
        <TutorNav mobile />
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
