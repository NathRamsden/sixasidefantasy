// app/api/leagues/join/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('sessionUserId');
    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userId = sessionCookie.value;

    const body = await req.json();
    const { code, teamName } = body as {
      code?: string;
      teamName?: string;
    };

    if (!code) {
      return NextResponse.json(
        { error: 'League code is required' },
        { status: 400 }
      );
    }

    const trimmedCode = code.trim().toUpperCase();

    const league = await prisma.league.findUnique({
      where: { code: trimmedCode },
    });

    if (!league) {
      return NextResponse.json(
        { error: 'League not found for that code' },
        { status: 404 }
      );
    }

    // Check if user already has a team in this league
    const existingTeam = await prisma.team.findFirst({
      where: {
        leagueId: league.id,
        userId,
      },
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: 'You already have a team in this league' },
        { status: 400 }
      );
    }

    const name =
      teamName?.trim() || 'My SixASide Team';

    const team = await prisma.team.create({
      data: {
        name,
        leagueId: league.id,
        userId,
      },
    });

    return NextResponse.json({ league, team });
  } catch (err) {
    console.error('Join league error', err);
    return NextResponse.json(
      { error: 'Unexpected error joining league' },
      { status: 500 }
    );
  }
}
