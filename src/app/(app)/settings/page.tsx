import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import NameForm from '@/components/NameForm';
import ChangePasswordForm from '@/components/ChangePasswordForm';
import SignOutButton from '@/components/SignOutButton';

export const metadata: Metadata = { title: 'Settings' };

const roleLabel: Record<string, string> = {
  STUDENT: 'Student',
  MENTOR: 'Mentor',
  INSTRUCTOR: 'Instructor',
  ADMIN: 'Admin',
};

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold">Settings</h1>

      <section className="card mt-6 p-6">
        <h2 className="font-display text-lg font-bold">Profile</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-400">Email</dt>
            <dd className="font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Role</dt>
            <dd className="font-medium">{roleLabel[user.role]}</dd>
          </div>
        </dl>
        <div className="mt-5 border-t border-slate-100 pt-5">
          <NameForm defaultName={user.name ?? ''} />
        </div>
      </section>

      <section className="card mt-6 p-6">
        <h2 className="font-display text-lg font-bold">Password</h2>
        <p className="mt-1 text-sm text-slate-500">
          {user.hasPassword
            ? 'Change the password you use to sign in.'
            : 'You sign in with magic links. Set a password to also sign in with one.'}
        </p>
        <div className="mt-4">
          <ChangePasswordForm hasPassword={user.hasPassword} />
        </div>
      </section>

      <section className="card mt-6 p-6">
        <h2 className="font-display text-lg font-bold">Session</h2>
        <p className="mt-1 text-sm text-slate-500">Signed in with a magic link. Sign out on this device.</p>
        <div className="mt-3 w-40">
          <SignOutButton />
        </div>
      </section>
    </div>
  );
}
