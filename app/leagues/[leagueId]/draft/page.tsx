// app/leagues/[leagueId]/draft/page.tsx
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type DraftPageProps = {
  params: Promise<{ leagueId: string }>;
};

export default async function DraftPage({ params }: DraftPageProps) {
  const { leagueId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: {
      owner: true,
      teams: {
        include: { user: true },
        orderBy: { createdAt: 'asc' },
      },
      drafts: {
        orderBy: { startedAt: 'desc' },
        take: 1,
        include: {
          orders: {
            include: { team: { include: { user: true } } },
            orderBy: { orderIndex: 'asc' },
          },
          picks: {
            include: {
              player: true,
              team: { include: { user: true } },
            },
            orderBy: { round: 'asc' },
          },
        },
      },
    },
  });

  if (!league) {
    notFound();
  }

  const draft = league.drafts[0] ?? null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-8 space-y-6">
      {/* DEBUG BANNER */}
      <div className="mb-4 rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white">
        DEBUG: Draft room v1 – if you see this, the draft route is working.
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Draft Room</h1>
          <p className="text-xs text-slate-400">
            League:{' '}
            <span className="font-semibold text-slate-200">
              {league.name}
            </span>
          </p>
        </div>

        <Link href={`/leagues/${league.id}`}>
          <button
            type="button"
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
          >
            ← Back to league
          </button>
        </Link>
      </div>

      {/* Teams in draft order */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Draft order</h2>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          {draft ? (
            <ol className="space-y-1 text-xs">
              {draft.orders.map((order, idx) => (
                <li key={order.id}>
                  <span className="mr-2 font-mono text-slate-400">
                    {idx + 1}.
                  </span>
                  <span className="font-semibold text-slate-100">
                    {order.team.name}
                  </span>{' '}
                  <span className="text-slate-400">
                    — {order.team.user.email}
                    {order.team.userId === user.id && ' (you)'}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-xs text-slate-400">
              No draft session found yet. Go back to the league page and start
              a draft.
            </p>
          )}
        </div>
      </section>

      {/* Picks so far */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Picks (readonly for now)</h2>
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          {draft && draft.picks.length > 0 ? (
            <table className="w-full text-xs">
              <thead className="text-slate-400">
                <tr className="border-b border-slate-800">
                  <th className="py-1 pr-2 text-left">Round</th>
                  <th className="py-1 pr-2 text-left">Pick</th>
                  <th className="py-1 pr-2 text-left">Team</th>
                  <th className="py-1 text-left">Player</th>
                </tr>
              </thead>
              <tbody>
                {draft.picks.map((pick) => (
                  <tr
                    key={pick.id}
                    className="border-b border-slate-900 last:border-none"
                  >
                    <td className="py-1 pr-2 font-mono text-slate-400">
                      {pick.round}
                    </td>
                    <td className="py-1 pr-2 font-mono text-slate-400">
                      {pick.pickNumber}
                    </td>
                    <td className="py-1 pr-2 text-slate-100">
                      {pick.team.name}
                    </td>
                    <td className="py-1 text-slate-100">
                      {pick.player?.name ?? 'Unknown player'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-slate-400">
              No picks have been made yet. Next step will be wiring up the
              “make pick” flow.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
