import type { ReactNode } from 'react';
import { TutorNav } from './_components/tutor-nav';
import { signOutTutorAction } from './actions';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import { LogOut } from 'lucide-react';

export default function TutorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-3">
            <h1 className="tracking-tight text-slate-900 text-xl font-bold sm:text-lg md:text-xl lg:text-xl">
              Tutor Portal
            </h1>
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
      <div className="mx-auto w-full max-w-7xl px-4 pb-24 pt-5 sm:px-6 sm:pb-6 md:pb-6">{children}</div>
      <div className="md:hidden">
        <TutorNav mobile />
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
