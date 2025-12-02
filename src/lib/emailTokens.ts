// src/lib/emailTokens.ts
import crypto from 'crypto';
import { prisma } from './prisma';

const TOKEN_EXPIRY_HOURS = 24; // how long verification links are valid (hours)

export async function createEmailVerificationToken(
  userId: string
): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  // Clear any old tokens for this user
  await prisma.emailVerificationToken.deleteMany({
    where: { userId },
  });

  // Your Prisma model requires both `token` and `tokenHash`
  await prisma.emailVerificationToken.create({
    data: {
      userId,
      token,      // raw token (used in dev links / could be removed later)
      tokenHash,  // hashed version for safer lookup
      expiresAt,
    },
  });

  // We send the raw token in the email link
  return token;
}

// What the verification helper can return
export type VerifyEmailResult =
  | 'invalid-or-expired'
  | 'already-verified'
  | { status: 'verified' };

export async function useEmailVerificationToken(
  token: string
): Promise<VerifyEmailResult> {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  // Find a matching, non-expired token
  const record = await prisma.emailVerificationToken.findFirst({
    where: {
      tokenHash,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: true,
    },
  });

  if (!record) {
    return 'invalid-or-expired';
  }

  // If already verified, just clean up tokens
  if (record.user.emailVerifiedAt) {
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: record.userId },
    });
    return 'already-verified';
  }

  // Mark user as verified and delete tokens in a single transaction
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.deleteMany({
      where: { userId: record.userId },
    }),
  ]);

  return { status: 'verified' };
}
