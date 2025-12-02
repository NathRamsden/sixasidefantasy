// app/api/email/verify/route.ts
import { NextResponse } from 'next/server';
import { verifyEmailToken } from '@/lib/emailTokens';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  try {
    const result = await verifyEmailToken(token);

    // result should contain at least userId, maybe more depending on your implementation
    return NextResponse.json(
      {
        success: true,
        userId: result.userId,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Verify token error', err);
    return NextResponse.json(
      { error: err?.message || 'Invalid or expired token' },
      { status: 400 }
    );
  }
}
