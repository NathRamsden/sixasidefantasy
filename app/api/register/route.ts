// app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createEmailVerificationToken } from '@/lib/emailTokens';
import { sendVerificationEmail } from '@/lib/email';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with that email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // NOTE: your User model uses `passwordHash`
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        // create default preferences row
        preferences: {
          create: {},
        },
      },
    });

    // Create verification token + "send" email (log to console)
    const token = await createEmailVerificationToken(user.id);
    const verifyUrl = `${BASE_URL}/verify-email?token=${token}`;
    await sendVerificationEmail(user.email, verifyUrl);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json(
      { error: 'Something went wrong while creating your account' },
      { status: 500 }
    );
  }
}
