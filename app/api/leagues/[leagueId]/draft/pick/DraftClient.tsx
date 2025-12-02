// app/leagues/[leagueId]/draft/DraftClient.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';

type DraftState = {
  leagueId: string;
  leagueName: string;
  userId: string;
  userTeamId: string | null;
  userTeamName: string | null;
  teamCount: number;
  picksPerTeam: number;
  totalPicks: number;
  picksSoFar: number;
  currentPickNumber: number;
  currentRound: number;
  isComplete: boolean;
  onClockTeamId: string | null;
  orders: {
    id: string;
    orderIndex: number;
    teamId: string;
    teamName: string;
    managerEmail: string;
  }[];
  picks: {
    id: string;
    round: number;
    pickNumber: number;
    teamName: string;
    managerEmail: string;
    playerName: string;
  }[];
  availablePlayers: {
    id: string;
    name: string;
  }[];
};

export default function DraftClient({ state }: { state: DraftState }) {
  const router = useRouter();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onClockOrder = state.orders.find(
    o => o.teamId === state.onClockTeamId
  );
  const isUserOnClock =
    !!state.userTeamId && state.userTeamId === state.onClockTeamId;

  const filteredPlayers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return state.availablePlayers;
    return state.availablePlayers.filter(p =>
      p.name.toLowerCase().includes(term)
    );
  }, [search, state.availablePlayers]);

  async function handlePick(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlayerId) return;
    setLoading(true);
    setError(null);
    setMsg(null);

    try {
      const res = await fetch(
        `/api/leagues/${state.leagueId}/draft/pick`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerId: selectedPlayerId }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to make pick');
      } else {
        setMsg('Pick successful!');
        setSelectedPlayerId('');
        setSearch('');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError('Unexpected error making pick');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
      {/* Left: status + picks */}
      <section className="space-y-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-2">
          {state.isComplete ? (
            <p className="text-sm text-emerald-400 font-semibold">
              Draft complete!
            </p>
          ) : onClockOrder ? (
            <>
              <p className="text-xs text-slate-400">
                Round {state.currentRound} • Pick {state.currentPickNumber} of{' '}
                {state.totalPicks}
              </p>
              <p className="text-sm">
                On the clock:{' '}
                <span className="font-semibold">
                  {onClockOrder.teamName}
                </span>{' '}
                <span className="text-xs text-slate-400">
                  ({onClockOrder.managerEmail})
                </span>
              </p>
              {isUserOnClock ? (
                <p className="text-xs text-emerald-400">
                  It&apos;s your pick!
                </p>
              ) : (
                <p className="text-xs text-slate-400">
                  Waiting for {onClockOrder.managerEmail} to pick.
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-400">
              Draft status unknown. Try refreshing.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="mb-2 text-sm font-semibold">Picks so far</h2>
          {state.picks.length === 0 && (
            <p className="text-xs text-slate-400">No picks yet.</p>
          )}
          <ol className="space-y-1 text-xs">
            {state.picks.map(p => (
              <li key={p.id}>
                <span className="text-slate-400">
                  R{p.round} P{p.pickNumber}:{' '}
                </span>
                <span className="font-semibold">{p.playerName}</span>{' '}
                <span className="text-slate-400">
                  — {p.teamName} ({p.managerEmail})
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Right: pick form */}
      <section className="space-y-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          <h2 className="text-sm font-semibold">Make your pick</h2>

          {!state.userTeamId && (
            <p className="text-xs text-rose-400">
              You don&apos;t have a team in this league.
            </p>
          )}

          {state.isComplete && (
            <p className="text-xs text-emerald-400">
              Draft is complete. No more picks can be made.
            </p>
          )}

          {!state.isComplete && state.userTeamId && !isUserOnClock && (
            <p className="text-xs text-slate-400">
              It&apos;s not your turn. You can still browse the player list.
            </p>
          )}

          {!state.isComplete && state.userTeamId && (
            <form onSubmit={handlePick} className="space-y-3">
              <div className="space-y-1">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search players..."
                  className="w-full rounded-md bg-slate-950 border border-slate-800 px-2 py-1 text-xs"
                />
              </div>

              <div className="space-y-1">
                <select
                  value={selectedPlayerId}
                  onChange={e => setSelectedPlayerId(e.target.value)}
                  className="w-full rounded-md bg-slate-950 border border-slate-800 px-2 py-1 text-xs"
                  size={8}
                >
                  {filteredPlayers.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {filteredPlayers.length === 0 && (
                  <p className="text-[11px] text-slate-500">
                    No available players matching that search.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  !selectedPlayerId ||
                  !isUserOnClock ||
                  state.isComplete
                }
                className="w-full inline-flex items-center justify-center rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {loading ? 'Submitting pick…' : 'Draft selected player'}
              </button>

              {error && (
                <p className="text-[11px] text-rose-400">{error}</p>
              )}
              {msg && (
                <p className="text-[11px] text-emerald-400">{msg}</p>
              )}
            </form>
          )}
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="mb-2 text-sm font-semibold">Draft order</h2>
          <ol className="space-y-1 text-xs">
            {state.orders.map(o => (
              <li key={o.id}>
                {o.orderIndex}. {o.teamName}{' '}
                <span className="text-slate-400">
                  ({o.managerEmail})
                </span>
                {o.teamId === state.userTeamId && (
                  <span className="ml-1 text-[10px] text-emerald-400">
                    — your team
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
