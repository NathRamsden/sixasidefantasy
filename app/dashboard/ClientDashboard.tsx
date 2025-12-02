// app/dashboard/ClientDashboard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';

type DashboardLeague = {
  id: string;
  name: string;
  code: string;
  teamsCount: number;
  role: 'owner' | 'manager';
};

type Props = {
  email: string;
  leagues: DashboardLeague[];
};

export default function ClientDashboard({ email, leagues }: Props) {
  const [leagueName, setLeagueName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [teamName, setTeamName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);

  async function handleCreateLeague(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoadingCreate(true);

    try {
      const res = await fetch('/api/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: leagueName || 'My League' }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create league');
      } else {
        setMessage(
          `League created! Name: ${data.league.name}, Code: ${data.league.code}`
        );
        setLeagueName('');
        // In a real version we’d refresh leagues via router.refresh()
      }
    } catch (err) {
      console.error(err);
      setError('Unexpected error creating league');
    } finally {
      setLoadingCreate(false);
    }
  }

  async function handleJoinLeague(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoadingJoin(true);

    try {
      const res = await fetch('/api/leagues/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: joinCode,
          teamName: teamName || `${email.split('@')[0]}'s team`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to join league');
      } else {
        setMessage(
          `Joined league "${data.league.name}" as team "${data.team.name}".`
        );
        setJoinCode('');
        setTeamName('');
        // In a real version we’d refresh leagues via router.refresh()
      }
    } catch (err) {
      console.error(err);
      setError('Unexpected error joining league');
    } finally {
      setLoadingJoin(false);
    }
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-300">Logged in as: {email}</p>

      {/* Create league */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        <h2 className="text-sm font-semibold">Create a league</h2>
        <p className="text-xs text-slate-400">
          You&apos;ll get a 6-character code to share with friends (max 6
          managers per league).
        </p>
        <form onSubmit={handleCreateLeague} className="space-y-2">
          <input
            type="text"
            placeholder="League name (optional)"
            value={leagueName}
            onChange={e => setLeagueName(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={loadingCreate}
            className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-700 disabled:opacity-60"
          >
            {loadingCreate ? 'Creating…' : 'Create league'}
          </button>
        </form>
      </section>

      {/* Join league */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        <h2 className="text-sm font-semibold">Join a league</h2>
        <form onSubmit={handleJoinLeague} className="space-y-2">
          <input
            type="text"
            placeholder="League code (e.g. ABC123)"
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand-500"
            required
          />
          <input
            type="text"
            placeholder="Your team name (optional)"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={loadingJoin}
            className="inline-flex items-center justify-center rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-700 disabled:opacity-60"
          >
            {loadingJoin ? 'Joining…' : 'Join league'}
          </button>
        </form>
      </section>

      {/* Messages */}
      {(message || error) && (
        <section className="text-sm">
          {message && <p className="text-emerald-400">{message}</p>}
          {error && <p className="text-rose-400">{error}</p>}
        </section>
      )}

      {/* Your leagues */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Your leagues</h2>
        {leagues.length === 0 ? (
          <p className="text-xs text-slate-500">
            You&apos;re not in any leagues yet. Create one or join with a code
            above.
          </p>
        ) : (
          <div className="space-y-2">
            {leagues.map(league => (
              <Link
                key={league.id}
                href={`/leagues/${league.id}`}
                className="block rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm hover:border-brand-500 hover:bg-slate-900 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{league.name}</p>
                    <p className="text-[11px] text-slate-400">
                      Code:{' '}
                      <span className="font-mono">{league.code}</span> •{' '}
                      {league.teamsCount}{' '}
                      {league.teamsCount === 1 ? 'team' : 'teams'}
                    </p>
                  </div>
                  <span className="text-[11px] uppercase tracking-wide text-slate-400">
                    {league.role === 'owner' ? 'Owner' : 'Manager'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
