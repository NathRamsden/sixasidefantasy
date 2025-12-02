// app/api/leagues/[leagueId]/draft/pick/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ leagueId: string }> }
) {
  try {
    const { leagueId } = await params;

    const body = await req.json().catch(() => null);
    const playerId: string | undefined = body?.playerId;

    if (!playerId) {
      return NextResponse.json({ error: 'playerId is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sessionUserId');
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const userId = sessionCookie.value;

    // Load league with teams + latest draft (with orders + picks)
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        teams: {
          include: { user: true },
          orderBy: { createdAt: 'asc' },
        },
        drafts: {
          orderBy: { startedAt: 'desc' },
          take: 1,
          include: {
            orders: {
              include: { team: true },
              orderBy: { orderIndex: 'asc' },
            },
            picks: {
              include: { player: true, team: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!league) {
      return NextResponse.json({ error: 'League not found' }, { status: 404 });
    }

    const draft = league.drafts[0];
    if (!draft) {
      return NextResponse.json(
        { error: 'Draft has not been started yet' },
        { status: 400 }
      );
    }

    if (!draft.startedAt) {
      return NextResponse.json(
        { error: 'Draft not started' },
        { status: 400 }
      );
    }

    // Find which team this user manages in this league
    const userTeam = league.teams.find(t => t.userId === userId);
    if (!userTeam) {
      return NextResponse.json(
        { error: 'You do not have a team in this league' },
        { status: 403 }
      );
    }

    // Make sure player exists
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Check player not already drafted in this draft
    const alreadyPicked = draft.picks.some(p => p.playerId === playerId);
    if (alreadyPicked) {
      return NextResponse.json(
        { error: 'Player already drafted' },
        { status: 400 }
      );
    }

    const teamCount = draft.orders.length;
    const picksPerTeam = 6; // six-a-side
    const totalPicks = teamCount * picksPerTeam;

    const picksSoFar = draft.picks.length;
    if (picksSoFar >= totalPicks) {
      return NextResponse.json(
        { error: 'Draft is already complete' },
        { status: 400 }
      );
    }

    const currentPickNumber = picksSoFar + 1;
    const currentRound = Math.ceil(currentPickNumber / teamCount);
    const indexWithinRound = (currentPickNumber - 1) % teamCount;

    // Snake order: odd round = normal, even = reversed
    let currentOrder;
    if (currentRound % 2 === 1) {
      currentOrder = draft.orders[indexWithinRound];
    } else {
      currentOrder = draft.orders[teamCount - 1 - indexWithinRound];
    }

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Cannot determine current team on the clock' },
        { status: 500 }
      );
    }

    // Ensure the user is picking for the team on the clock
    if (currentOrder.teamId !== userTeam.id) {
      return NextResponse.json(
        { error: 'It is not your turn to pick' },
        { status: 403 }
      );
    }

    // Create pick + link player to team
    const pick = await prisma.draftPick.create({
      data: {
        draftSessionId: draft.id,
        teamId: userTeam.id,
        playerId,
        round: currentRound,
        pickNumber: currentPickNumber,
      },
    });

    // Also create TeamPlayer record so that team "owns" the player
    await prisma.teamPlayer.create({
      data: {
        teamId: userTeam.id,
        playerId,
        acquiredAt: new Date(),
        active: true,
      },
    });

    return NextResponse.json({ pick });
  } catch (err) {
    console.error('Draft pick error', err);
    return NextResponse.json(
      { error: 'Unexpected error making pick' },
      { status: 500 }
    );
  }
}
