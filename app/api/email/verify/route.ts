// app/api/email/verify/route.ts
import { NextResponse } from 'next/server';
import { useEmailVerificationToken } from '@/lib/emailTokens';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { success: false, error: 'Missing verification token' },
      { status: 400 }
    );
  }

  const result = await useEmailVerificationToken(token);

  if (result === 'invalid-or-expired') {
    return NextResponse.json(
      {
        success: false,
        error: 'This verification link is invalid or has expired. Please request a new one.',
      },
      { status: 400 }
    );
  }

  if (result === 'already-verified') {
    return NextResponse.json(
      {
        success: true,
        message: 'Email was already verified.',
      },
      { status: 200 }
    );
  }

  // If we get here, the token was valid and the email is now verified.
  // We don't actually need to expose userId in the response right now.
  return NextResponse.json(
    {
      success: true,
      message: 'Email verified successfully.',
    },
    { status: 200 }
  );
}
