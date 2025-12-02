// app/api/leagues/[leagueId]/draft/start/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    // ✅ params is a Promise in Next 16 app routes
    const { leagueId } = await params;

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sessionUserId');
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = sessionCookie.value;

    // Load league with teams and existing drafts
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        teams: { orderBy: { createdAt: 'asc' } },
        drafts: {
          orderBy: { startedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }

    if (league.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Only the league owner can start the draft' },
        { status: 403 }
      );
    }

    // Require at least 2 teams, no upper limit
    if (league.teams.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 teams are required to start a draft' },
        { status: 400 }
      );
    }

    const existingDraft = league.drafts[0];
    if (existingDraft && existingDraft.startedAt) {
      return NextResponse.json(
        { error: 'Draft has already been started for this league' },
        { status: 400 }
      );
    }

    const draftSession = await prisma.draftSession.create({
      data: {
        leagueId: league.id,
        type: 'INITIAL',
        startedAt: new Date(),
        orders: {
          create: league.teams.map((team, idx) => ({
            orderIndex: idx + 1, // 1..N
            teamId: team.id,
          })),
        },
      },
      include: {
        orders: {
          include: { team: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return NextResponse.json({ draftSession });
  } catch (err) {
    console.error('Start draft error', err);
    return NextResponse.json(
      { error: 'Unexpected error starting draft' },
      { status: 500 }
    );
  }
}
