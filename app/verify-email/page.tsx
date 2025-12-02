// app/verify-email/page.tsx
import Link from 'next/link';
import { useEmailVerificationToken } from '@/lib/emailTokens';

type VerifyEmailPageProps = {
  // In Next 15/16 app router, searchParams is a Promise on the server
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const tokenParam = params.token;
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

  let status: 'missing' | 'invalid' | 'already' | 'ok' = 'missing';

  if (!token) {
    status = 'missing';
  } else {
    const result = await useEmailVerificationToken(token);

    if (result === 'invalid-or-expired') {
      status = 'invalid';
    } else if (result === 'already-verified') {
      status = 'already';
    } else if (result.status === 'verified') {
      status = 'ok';
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h1 className="text-xl font-semibold">
          {status === 'ok' && 'Email verified ✅'}
          {status === 'already' && 'Already verified'}
          {status === 'invalid' && 'Verification link invalid'}
          {status === 'missing' && 'No token provided'}
        </h1>

        {status === 'ok' && (
          <p className="text-sm text-slate-300">
            Your email has been verified and your SixASide account is ready to use.
          </p>
        )}

        {status === 'already' && (
          <p className="text-sm text-slate-300">
            This email address was already verified. You can log in to your account.
          </p>
        )}

        {status === 'invalid' && (
          <p className="text-sm text-slate-300">
            This verification link is invalid or has expired. Try registering again with
            the same email to get a fresh link.
          </p>
        )}

        {status === 'missing' && (
          <p className="text-sm text-slate-300">
            There was no verification token in the link. Please click the button directly
            from your verification email.
          </p>
        )}

        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400 transition-colors"
          >
            Go to login
          </Link>
        </div>
      </div>
    </main>
  );
}
