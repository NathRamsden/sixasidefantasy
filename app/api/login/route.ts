// app/api/login/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    // Require verified email
    if (!user.emailVerifiedAt) {
      return NextResponse.json(
        { error: 'Please verify your email before logging in.' },
        { status: 403 },
      );
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    // Very simple session cookie (we can upgrade later)
    const cookieStore = await cookies();
    cookieStore.set('session', user.id, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Login error', err);
    return NextResponse.json(
      { error: 'Unexpected error logging in' },
      { status: 500 },
    );
  }
}
