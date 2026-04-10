'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

type ResetPasswordFormProps = {
  code?: string;
  initialError?: string;
};

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

export default function ResetPasswordForm({ code, initialError }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(initialError ?? null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const passwordScore = useMemo(() => getPasswordStrengthScore(password), [password]);

  useEffect(() => {
    const supabase = createClient();

    async function prepareSession() {
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          setLocalError(error.message);
          setReady(false);
          return;
        }
      }

      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setLocalError('This reset link is invalid or has expired.');
        setReady(false);
        return;
      }

      setReady(true);
    }

    prepareSession().catch(() => {
      setLocalError('This reset link is invalid or has expired.');
      setReady(false);
    });
  }, [code]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!ready) {
      setLocalError('This reset link is invalid or has expired.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    if (passwordScore < 2) {
      setLocalError('Choose a stronger password (at least 8+ chars with mixed character types).');
      return;
    }

    setLoading(true);
    setLocalError(null);

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      setLoading(false);
      setLocalError('This reset link is invalid or has expired.');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setLoading(false);
      setLocalError(error.message);
      return;
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();

    setLoading(false);
    router.replace(profile?.role === 'tutor' ? '/tutor/dashboard' : '/portal/dashboard');
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center px-4 py-10 sm:py-14">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-lg sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
          Reset Password
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Create a new password
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Choose a strong password for your TutorFlow account.
        </p>

        {localError ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {localError}
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-800">
              New Password
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
                placeholder="Create a strong password"
                disabled={!ready || loading}
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

          <div className="space-y-2">
            <label htmlFor="confirm_password" className="text-sm font-medium text-slate-800">
              Confirm New Password
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
                disabled={!ready || loading}
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

          <p className="text-xs text-slate-500">
            Use at least 8 characters with uppercase, lowercase, numbers, and symbols.
          </p>

          <button
            type="submit"
            disabled={!ready || loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </main>
  );
}