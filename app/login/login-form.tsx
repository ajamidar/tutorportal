'use client';

import { useState } from 'react';
import { signInAction, signUpAction } from './actions';

type LoginFormProps = {
  error?: string;
};

export default function LoginForm({ error }: LoginFormProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <main className="flex min-h-screen items-center px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-lg sm:p-7">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Trusted Institution
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">TutorPortal</h1>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === 'signin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === 'signup'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <form action={mode === 'signin' ? signInAction : signUpAction} className="mt-5 space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-800">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-blue-400"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-800">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-blue-400"
              placeholder="Your password"
            />
          </div>

          {mode === 'signup' ? (
            <>
              <div className="space-y-2">
                <label htmlFor="full_name" className="text-sm font-medium text-slate-800">
                  Full Name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-blue-400"
                  placeholder="Jane Smith"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium text-slate-800">
                  Account Role
                </label>
                <select
                  id="role"
                  name="role"
                  defaultValue="client"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-blue-400"
                >
                  <option value="client">Client (Parent/Student)</option>
                  <option value="tutor">Tutor</option>
                </select>
              </div>
            </>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </main>
  );
}
