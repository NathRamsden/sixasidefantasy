// src/app/api/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // Next.js 16 in /src: cookies() is async
  const cookieStore = await cookies();

  // Clear the session cookie by expiring it
  cookieStore.set('sessionUserId', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return NextResponse.json({ success: true });
}
