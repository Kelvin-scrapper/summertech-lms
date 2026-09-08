import { redirect } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import PasswordLoginForm from '@/components/PasswordLoginForm';
import MagicLinkForm from '@/components/MagicLinkForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; method?: string }>;
}) {
  if (await getCurrentUser()) redirect('/dashboard');
  const { error, next, method } = await searchParams;
  const useMagic = method === 'link';

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent-600 text-white">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="font-display text-xl font-bold">Summertech</span>
        </div>

        <h1 className="font-display text-2xl font-bold">Sign in to keep learning</h1>
        <p className="mt-1 mb-6 text-sm text-slate-500">
          {useMagic ? 'We’ll email you a secure link — no password needed.' : 'Use the email and password your administrator set up.'}
        </p>

        {error === 'link' ? (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            That sign-in link was invalid or expired. Try again.
          </p>
        ) : null}

        {useMagic ? <MagicLinkForm /> : <PasswordLoginForm next={next} />}

        <div className="mt-6 text-center text-sm">
          {useMagic ? (
            <a href="/login" className="font-medium text-accent-600">
              Sign in with a password instead
            </a>
          ) : (
            <a href="/login?method=link" className="font-medium text-accent-600">
              Email me a sign-in link instead
            </a>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Accounts are created and approved by an administrator. No public sign-up.
        </p>
      </div>
    </main>
  );
}
