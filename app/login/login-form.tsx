'use client';

import { FormEvent, useMemo, useState } from 'react';
import { sendPasswordResetAction, signInAction, signUpAction } from './actions';

type LoginFormProps = {
  error?: string;
  initialMode?: 'signin' | 'signup' | 'reset';
  resetSent?: boolean;
};

const STRENGTH_LEVELS = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'] as const;

function getPasswordStrengthScore(password: string): number {
  if (!password) return 0;

  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return Math.min(score, 4);
}

function getStrengthColor(score: number): string {
  if (score <= 1) return 'bg-red-500';
  if (score === 2) return 'bg-amber-500';
  if (score === 3) return 'bg-sky-500';
  return 'bg-emerald-500';
}

export default function LoginForm({ error, initialMode = 'signin', resetSent = false }: LoginFormProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const passwordScore = useMemo(() => getPasswordStrengthScore(password), [password]);
  const strengthWidth = ((passwordScore + 1) / 5) * 100;

  const activeError = localError ?? error;

  function handleModeChange(nextMode: 'signin' | 'signup' | 'reset') {
    setMode(nextMode);
    setLocalError(null);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (mode === 'signin' || mode === 'reset') {
      setLocalError(null);
      return;
    }

    if (password !== confirmPassword) {
      event.preventDefault();
      setLocalError('Passwords do not match.');
      return;
    }

    if (passwordScore < 2) {
      event.preventDefault();
      setLocalError('Choose a stronger password (at least 8+ chars with mixed character types).');
      return;
    }

    setLocalError(null);
  }

  return (
    <main className="flex min-h-screen items-center px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-lg sm:p-7">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            #1 Platform for tutors and students
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">TutorPortal</h1>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          {mode === 'signin'
            ? 'Sign in to your account'
            : mode === 'signup'
              ? 'Create your account'
              : 'Reset your password'}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => handleModeChange('signin')}
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
            onClick={() => handleModeChange('signup')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === 'signup'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('reset')}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              mode === 'reset'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            Reset
          </button>
        </div>

        {resetSent ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            If the email exists, a password reset link has been sent.
          </p>
        ) : null}

        {activeError ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {activeError}
          </p>
        ) : null}

        <form
          action={mode === 'signin' ? signInAction : mode === 'signup' ? signUpAction : sendPasswordResetAction}
          onSubmit={handleSubmit}
          className="mt-5 space-y-4"
        >
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

          {mode !== 'reset' ? (
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-800">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (localError) setLocalError(null);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-20 text-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-blue-400"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          ) : null}

          {mode === 'signup' ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Password strength</span>
                  <span className="font-medium text-slate-700">{STRENGTH_LEVELS[passwordScore]}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${getStrengthColor(passwordScore)}`}
                    style={{ width: `${strengthWidth}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500" aria-live="polite">
                  Use at least 8 characters with uppercase, lowercase, numbers, and symbols.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm_password" className="text-sm font-medium text-slate-800">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      if (localError) setLocalError(null);
                    }}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-20 text-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-blue-400"
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

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
                  <option value="client">Student (Parent/Student)</option>
                  <option value="tutor">Tutor</option>
                </select>
              </div>
            </>
          ) : null}

          {mode === 'signin' ? (
            <button
              type="button"
              onClick={() => handleModeChange('reset')}
              className="text-left text-sm font-medium text-blue-700 transition hover:text-blue-600"
            >
              Forgot password?
            </button>
          ) : null}

          {mode === 'reset' ? (
            <p className="text-sm text-slate-600">
              Enter your email address and we’ll send a link to create a new password.
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </main>
  );
}
