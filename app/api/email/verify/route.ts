// app/api/email/verify/route.ts
import { NextResponse } from 'next/server';
import { useEmailVerificationToken } from '@/lib/emailTokens';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const user = await useEmailVerificationToken(token);

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 400 }
    );
  }

  // Redirect user to login with a little flag
  const url = new URL('/login', req.url);
  url.searchParams.set('verified', '1');
  return NextResponse.redirect(url.toString());
}
