// src/lib/emailTokens.ts
import crypto from 'crypto';
import { prisma } from './prisma';

const EMAIL_TOKEN_TTL_HOURS = 24;

export async function createEmailVerificationToken(userId: string) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + EMAIL_TOKEN_TTL_HOURS);

  const record = await prisma.authToken.create({
    data: {
      userId,
      type: 'EMAIL_VERIFY',
      token,
      expiresAt,
    },
  });

  return record;
}

export async function useEmailVerificationToken(token: string) {
  const record = await prisma.authToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record) return null;
  if (record.type !== 'EMAIL_VERIFY') return null;
  if (record.usedAt) return null;
  if (record.expiresAt < new Date()) return null;

  // mark used
  await prisma.authToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  // mark user verified
  const user = await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerifiedAt: new Date() },
  });

  return user;
}
