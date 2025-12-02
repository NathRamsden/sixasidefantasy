// app/verify-email/page.tsx
import Link from 'next/link';
import { verifyEmailToken } from '@/lib/emailTokens';

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function VerifyEmailPage({
  searchParams,
}: VerifyEmailPageProps) {
  const params = await searchParams;
  const rawToken = params.token;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

  let heading = 'Email verification';
  let message = '';
  let success = false;

  if (!token) {
    message =
      'This verification link is missing a token. Please check the link in your email or request a new verification email.';
  } else {
    const result = await verifyEmailToken(token);

    switch (result) {
      case 'ok':
        success = true;
        message =
          'Thanks! Your email has been verified. You can now log in to SixASide.';
        break;
      case 'already-verified':
        success = true;
        message =
          'Your email was already verified. You can go ahead and log in.';
        break;
      case 'expired':
        message =
          'Sorry, this verification link has expired. Please request a new verification email.';
        break;
      case 'invalid':
      default:
        message =
          'This verification link is invalid. It may have already been used or copied incorrectly.';
        break;
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
      <div className="max-w-md w-full mx-4 rounded-2xl bg-slate-900 border border-slate-700 p-8 shadow-lg">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          {heading}
        </h1>

        <p
          className={`text-sm mb-8 text-center ${
            success ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {message}
        </p>

        <div className="flex justify-center">
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-medium transition-colors"
          >
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
