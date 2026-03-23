import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { signOutClientAction } from './actions';

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <h1 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
            Client Portal
          </h1>
          <form action={signOutClientAction}>
            <Button type="submit" variant="outline" className="h-9 px-3">
              Sign Out
            </Button>
          </form>
        </div>
      </header>
      <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6">{children}</div>
    </div>
  );
}
