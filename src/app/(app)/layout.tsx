import { requireUser } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';

const roleLabel: Record<string, string> = {
  STUDENT: 'Student',
  MENTOR: 'Mentor',
  INSTRUCTOR: 'Instructor',
  ADMIN: 'Admin',
};

function initials(name: string | null, email: string) {
  const src = name?.trim() || email;
  return src
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role={user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-end border-b border-slate-200 bg-slate-50/80 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium leading-tight">{user.name ?? user.email}</p>
              <p className="text-xs text-slate-500">{roleLabel[user.role]}</p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
              {initials(user.name, user.email)}
            </div>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
