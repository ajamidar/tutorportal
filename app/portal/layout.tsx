import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { signOutClientAction } from './actions';
import { PortalNav } from './_components/portal-nav';

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3 sm:gap-6 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <h1 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              Student Portal
            </h1>
          </div>

          <div className="hidden sm:block">
            <PortalNav mobile={false} />
          </div>

          <form action={signOutClientAction}>
            <Button type="submit" variant="outline" className="h-9 rounded-xl px-3 text-xs sm:text-sm bg-red-500 border-red-600 hover:border-red-600 shadow-sm shadow-red-700 text-white hover:bg-red-400 hover:text-white">
              Sign Out
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 pb-24 pt-5 sm:px-6 sm:pb-6">{children}</main>

      <div className="sm:hidden">
        <PortalNav mobile />
      </div>
    </div>
  );
}
