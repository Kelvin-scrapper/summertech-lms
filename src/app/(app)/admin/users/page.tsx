import type { Metadata } from 'next';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminCreateUserForm from '@/components/AdminCreateUserForm';
import RoleSelect from '@/components/RoleSelect';
import ActiveToggle from '@/components/ActiveToggle';

export const metadata: Metadata = { title: 'Admin · Users' };

export default async function AdminUsersPage() {
  const me = await requireRole(['ADMIN']);
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { enrollments: true, teaches: true } } },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl font-bold">Users</h1>
      <p className="mt-1 text-slate-500">
        Create an account, then the person requests a magic link to sign in.
      </p>

      <div className="card mt-6 p-5">
        <AdminCreateUserForm />
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-400">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Access</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Enrolled</th>
              <th className="px-5 py-3 font-medium">Sign-in</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 last:border-0">
                <td className="px-5 py-3 font-medium">{u.name ?? '—'}</td>
                <td className="px-5 py-3 text-slate-600">{u.email}</td>
                <td className="px-5 py-3">
                  <ActiveToggle userId={u.id} active={u.active} disabled={u.id === me.id} />
                </td>
                <td className="px-5 py-3">
                  <RoleSelect userId={u.id} role={u.role} disabled={u.id === me.id} />
                </td>
                <td className="px-5 py-3 text-slate-600">
                  {u._count.enrollments}
                  {u._count.teaches > 0 ? ` · tutors ${u._count.teaches}` : ''}
                </td>
                <td className="px-5 py-3 text-slate-500">
                  {u.passwordHash ? 'password' : 'magic link'}
                  {u.emailVerified ? ' · verified' : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Suspend to revoke access without deleting. You can&apos;t change your own role or access here.
      </p>
    </div>
  );
}
