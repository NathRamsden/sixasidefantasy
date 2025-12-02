// app/leagues/[leagueId]/page.tsx
import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import StartDraftClient from './StartDraftClient';

type LeaguePageProps = {
  params: Promise<{ leagueId: string }>;
};

export default async function LeaguePage({ params }: LeaguePageProps) {
  const { leagueId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: {
      owner: true,
      season: true,
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
        },
      },
    },
  });

  if (!league) {
    notFound();
  }

  const latestDraft = league.drafts[0] ?? null;
  const isOwner = league.ownerId === user.id;

  return (
    <main className="mx-auto max-w-5xl px-6 py-8 space-y-6">
      {/* DEBUG BANNER */}
      <div className="mb-4 rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white">
        DEBUG: League page v3 – if you see this, we are in the right file.
      </div>

      {/* Original header + teams */}
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{league.name}</h1>
          <p className="text-xs text-slate-400">
            League code:{' '}
            <span className="font-mono bg-slate-900/70 px-2 py-0.5 rounded">
              {league.code}
            </span>
          </p>
        </div>
        <div className="text-right text-xs text-slate-400 space-y-1">
          <p>
            Owner:{' '}
            <span className="font-medium text-slate-200">
              {league.owner.email}
            </span>
          </p>
          <p>
            Season:{' '}
            <span className="font-medium text-slate-200">
              {league.season?.name ?? 'Default Season'}
            </span>
          </p>
        </div>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Teams ({league.teams.length})</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {league.teams.map((team) => (
            <div
              key={team.id}
              className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3"
            >
              <p className="text-sm font-semibold">{team.name}</p>
              <p className="text-xs text-slate-400">
                Manager: {team.user.email}
                {team.userId === user.id && ' (you)'}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Draft section – VERY SIMPLE */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Draft</h2>

        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-3">
          {latestDraft ? (
            <>
              <p className="text-xs text-emerald-400">
                Draft started at{' '}
                {latestDraft.startedAt
                  ? new Date(latestDraft.startedAt).toLocaleString('en-GB')
                  : 'unknown time'}
              </p>

              {/* Always show a huge button if we have a draft */}
              <div className="pt-3">
                <Link href={`/leagues/${league.id}/draft`}>
                  <button
                    type="button"
                    className="w-full rounded-md bg-green-500 px-4 py-3 text-sm font-extrabold text-black hover:bg-green-400"
                  >
                    GO TO DRAFT ROOM
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-400">
                Draft has not been started yet.
              </p>

              {isOwner && (
                <div className="mt-2">
                  <StartDraftClient
                    leagueId={league.id}
                    hasDraft={false}
                    teamCount={league.teams.length}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
