import type { ReactNode } from 'react';
import { TutorNav } from './_components/tutor-nav';
import { signOutTutorAction } from './actions';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';

export default function TutorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              Tutor Portal
            </h1>
            <form action={signOutTutorAction} className="md:hidden">
              <Button type="submit" variant="outline">
                Sign Out
              </Button>
            </form>
          </div>
          <TutorNav />
          <form action={signOutTutorAction} className="hidden md:block">
            <Button type="submit" variant="outline">
              Sign Out
            </Button>
          </form>
        </div>
      </header>
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6">{children}</div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
