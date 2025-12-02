// src/lib/email.ts

// For now just log links to the console.
// Later we plug in a real provider like Resend.
export async function sendVerificationEmail(to: string, verifyUrl: string) {
  console.log('--- EMAIL (DEV) ---');
  console.log(`To: ${to}`);
  console.log('Subject: Verify your SixASide account');
  console.log(`Body: Click this link to verify your email: ${verifyUrl}`);
  console.log('-------------------');
}
