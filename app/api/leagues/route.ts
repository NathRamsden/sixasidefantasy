// app/api/leagues/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

function generateLeagueCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

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
    const { name } = body as { name?: string };
    const leagueName = name?.trim() || 'My SixASide League';

    // Very simple default season for now
    let season = await prisma.season.findFirst();
    if (!season) {
      const now = new Date();
      const nextYear = new Date(now);
      nextYear.setFullYear(now.getFullYear() + 1);

      season = await prisma.season.create({
        data: {
          name: 'Default Season',
          startDate: now,
          endDate: nextYear,
        },
      });
    }

    // Generate a unique code
    let code: string;
    // Small loop to avoid collisions
    // (extremely unlikely, but just in case)
    // eslint-disable-next-line no-constant-condition
    while (true) {
      code = generateLeagueCode(6);
      const existing = await prisma.league.findUnique({ where: { code } });
      if (!existing) break;
    }

    const league = await prisma.league.create({
      data: {
        name: leagueName,
        code,
        ownerId: userId,
        seasonId: season.id,
      },
    });

    return NextResponse.json({ league });
  } catch (err) {
    console.error('Create league error', err);
    return NextResponse.json(
      { error: 'Unexpected error creating league' },
      { status: 500 }
    );
  }
}
