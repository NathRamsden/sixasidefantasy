// src/lib/emailTokens.ts
import crypto from 'crypto';
import { prisma } from './prisma';

const TOKEN_EXPIRY_HOURS = 24;

// Simple helper so we always hash tokens the same way
function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * Create a new verification token for a user and store a hashed version in DB.
 * Returns the plain token (which we put in the email link).
 */
export async function createEmailVerificationToken(userId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = sha256(token);

  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return token;
}

export type VerifyEmailResult =
  | 'ok'
  | 'already-verified'
  | 'expired'
  | 'invalid';

/**
 * Given the raw token from the URL, validate it and, if valid, mark the
 * user as verified and mark the token as used.
 */
export async function verifyEmailToken(
  rawToken: string,
): Promise<VerifyEmailResult> {
  const tokenHash = sha256(rawToken);

  const record = await prisma.emailVerificationToken.findFirst({
    where: {
      tokenHash,
    },
    include: {
      user: true,
    },
  });

  if (!record) {
    // No matching token
    return 'invalid';
  }

  // Expired?
  if (record.expiresAt < new Date()) {
    return 'expired';
  }

  // If it's already been used, check if the user is already verified
  if (record.usedAt) {
    if (record.user.emailVerifiedAt) {
      return 'already-verified';
    }
    return 'invalid';
  }

  // Mark token as used + mark user as verified in a transaction
  const now = new Date();

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: now },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: {
        emailVerifiedAt: record.user.emailVerifiedAt ?? now,
      },
    }),
  ]);

  return 'ok';
}
