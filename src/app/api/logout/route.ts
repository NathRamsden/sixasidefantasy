// app/api/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = cookies();
  cookieStore.set('sessionUserId', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // delete cookie
  });

  return NextResponse.json({ success: true });
}
