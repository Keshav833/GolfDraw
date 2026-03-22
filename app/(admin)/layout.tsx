import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutGrid,
  Users,
  Trophy,
  ShieldCheck,
  Heart,
  LogOut,
} from 'lucide-react';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { adminSignOut } from '@/app/(auth)/actions';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await requireAdmin();
  } catch (err: any) {
    if (err.message === 'UNAUTHENTICATED') {
      redirect('/login');
    }
    // Authenticated but not admin
    redirect('/dashboard');
  }

  const user = session.user;
  const initials = user.email?.substring(0, 2).toUpperCase() || 'AD';

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 flex flex-col border-r border-[var(--sd)] bg-[var(--bg)] p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--bg)] shadow-[var(--raised-sm)]">
              <LayoutGrid className="h-6 w-6 text-[var(--green-700)]" />
            </div>
            <span className="text-2xl font-serif text-[var(--text)]">
              Admin
            </span>
          </div>

          <nav className="flex-1 space-y-4">
            <SidebarItem
              href="/admin"
              icon={<LayoutGrid size={20} />}
              label="Overview"
            />
            <SidebarItem
              href="/admin/users"
              icon={<Users size={20} />}
              label="Users"
            />
            <SidebarItem
              href="/admin/draws"
              icon={<Trophy size={20} />}
              label="Draws"
            />
            <SidebarItem
              href="/admin/winners"
              icon={<ShieldCheck size={20} />}
              label="Winners"
            />
            <SidebarItem
              href="/admin/charities"
              icon={<Heart size={20} />}
              label="Charities"
            />
          </nav>

          <div className="mt-auto pt-6 border-t border-[var(--sd)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-[var(--bg)] shadow-[var(--raised-sm)] text-[var(--green-700)] font-bold">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.email}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  Administrator
                </p>
              </div>
            </div>

            <form action={adminSignOut}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-muted)] hover:text-[var(--text)] transition-all bg-[var(--bg)] hover:shadow-[var(--raised-sm)]"
              >
                <LogOut size={20} />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-muted)] hover:text-[var(--text)] transition-all bg-[var(--bg)] hover:shadow-[var(--raised-sm)] active:shadow-[var(--inset-sm)]"
    >
      <span className="text-[var(--green-700)]">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}
