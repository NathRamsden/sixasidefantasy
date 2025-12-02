// app/leagues/[leagueId]/StartDraftClient.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  leagueId: string;
  hasDraft: boolean;
  teamCount: number;
};

export default function StartDraftClient({
  leagueId,
  hasDraft,
  teamCount,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // NEW RULE: draft can start when there are at least 2 teams
  const canStart = !hasDraft && teamCount >= 2;

  async function handleStartDraft() {
    setMsg(null);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/leagues/${leagueId}/draft/start`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to start draft');
      } else {
        setMsg('Draft started!');
        router.refresh(); // reload server data
      }
    } catch (err) {
      console.error(err);
      setError('Unexpected error starting draft');
    } finally {
      setLoading(false);
    }
  }

  if (!canStart && !hasDraft) {
    return (
      <p className="text-[11px] text-slate-500">
        Draft can be started once at least <span className="font-semibold">2</span>{' '}
        teams have joined. Currently: {teamCount}.
      </p>
    );
  }

  if (hasDraft) {
    return (
      <>
        {msg && (
          <p className="text-[11px] text-emerald-400">
            {msg}
          </p>
        )}
      </>
    );
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleStartDraft}
        disabled={loading || !canStart}
        className="inline-flex items-center justify-center rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {loading ? 'Starting draft…' : 'Start draft'}
      </button>
      {error && (
        <p className="text-[11px] text-rose-400">
          {error}
        </p>
      )}
      {msg && !loading && (
        <p className="text-[11px] text-emerald-400">
          {msg}
        </p>
      )}
    </div>
  );
}
