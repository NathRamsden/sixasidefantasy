// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Show message if redirected from email verification
  const verified = searchParams.get('verified') === '1';

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h1 className="text-xl font-semibold mb-4 text-center">
          Login to SixASide
        </h1>

        {verified && (
          <div className="mb-4 rounded-md border border-emerald-500 bg-emerald-900/30 px-3 py-2 text-sm text-emerald-200">
            Your email has been verified. You can now log in.
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="px-3 py-2 rounded-md bg-slate-950 border border-slate-700 text-sm outline-none focus:border-emerald-400"
          />
          <input
            type="password"
            placeholder="Password"
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="px-3 py-2 rounded-md bg-slate-950 border border-slate-700 text-sm outline-none focus:border-emerald-400"
          />

          {error && (
            <p className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex items-center justify-center rounded-md bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium text-slate-950 transition-colors"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </main>
  );
}
