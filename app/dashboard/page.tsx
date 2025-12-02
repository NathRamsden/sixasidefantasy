// app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ClientDashboard from './ClientDashboard';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // All leagues where you're owner OR have a team
  const leagues = await prisma.league.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        {
          teams: {
            some: { userId: user.id },
          },
        },
      ],
    },
    include: {
      _count: { select: { teams: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const leaguesWithRole = leagues.map(l => ({
    id: l.id,
    name: l.name,
    code: l.code,
    teamsCount: l._count.teams,
    role: l.ownerId === user.id ? ('owner' as const) : ('manager' as const),
  }));

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold">SixASide Dashboard</h1>
      <ClientDashboard email={user.email} leagues={leaguesWithRole} />
    </main>
  );
}
