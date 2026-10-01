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
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-brand-950 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -top-24 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-accent-600/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-brand-700/30 blur-[100px]" />

        <div className="relative flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
            <GraduationCap className="h-5 w-5 text-accent-500" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-white">Summertech</span>
        </div>

        <div className="relative">
          <h2 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-white">
            Pick up where
            <br /> you <span className="text-accent-500">left off.</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-brand-100/85">
            Your lessons, notes, and mentor check-ins — all in one place.
          </p>
        </div>

        <p className="relative text-sm text-brand-100/60">Not free — but finishable.</p>
      </section>

      <div className="grid place-items-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900">
              <GraduationCap className="h-5 w-5 text-accent-500" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">Summertech</span>
          </div>

          <p className="eyebrow">Student portal</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Sign in to keep learning</h1>
          <p className="mt-2 mb-7 text-sm text-slate-500">
            {useMagic ? 'We’ll email you a secure link — no password needed.' : 'Use the email and password your administrator set up.'}
          </p>

          {error === 'link' ? (
            <p className="mb-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              That sign-in link was invalid or expired. Try again.
            </p>
          ) : null}

          {useMagic ? <MagicLinkForm /> : <PasswordLoginForm next={next} />}

          <div className="mt-6 text-center text-sm">
            {useMagic ? (
              <a href="/login" className="font-medium text-accent-600 hover:text-accent-700">
                Sign in with a password instead
              </a>
            ) : (
              <a href="/login?method=link" className="font-medium text-accent-600 hover:text-accent-700">
                Email me a sign-in link instead
              </a>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Accounts are created and approved by an administrator. No public sign-up.
          </p>
        </div>
      </div>
    </main>
  );
}
