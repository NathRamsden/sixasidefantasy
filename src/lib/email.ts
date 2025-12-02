// src/lib/email.ts

// For now we just log the email to the dev console.
// Later we can plug in real SMTP or a service like Resend/SendGrid.
export async function sendVerificationEmail(to: string, verifyUrl: string) {
  console.log('--- EMAIL (DEV) ---');
  console.log('To:', to);
  console.log('Subject: Verify your SixASide account');
  console.log('Body: Click this link to verify your email:', verifyUrl);
  console.log('-------------------');
}
