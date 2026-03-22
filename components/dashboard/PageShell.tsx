'use client';

import Link from 'next/link';
import { Bell, LayoutGrid, Search, User2, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { signOut } from '@/app/(auth)/actions';
import { Sidebar } from './Sidebar';

const raised = '5px 5px 12px var(--dashboard-shadow-dark), -5px -5px 12px var(--dashboard-shadow-light)';
const raisedSm = '3px 3px 8px var(--dashboard-shadow-dark), -3px -3px 8px var(--dashboard-shadow-light)';
const raisedXs = '2px 2px 5px var(--dashboard-shadow-dark), -2px -2px 5px var(--dashboard-shadow-light)';
const insetShadow =
  'inset 3px 3px 7px var(--dashboard-shadow-dark), inset -3px -3px 7px var(--dashboard-shadow-light)';

export function PageShell({
  userName,
  membershipLabel,
  statusLabel,
  title,
  subtitle,
  children,
}: {
  userName: string;
  membershipLabel: string;
  statusLabel: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const initials =
    userName
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'GD';

  return (
    <div className="mx-auto max-w-[1400px] h-screen px-4 py-6 overflow-hidden">
      <div
        className="h-full overflow-hidden rounded-[24px] bg-[var(--dashboard-bg)] p-4 sm:p-5 lg:p-6"
        style={{ boxShadow: raised }}
      >
        <div className="flex h-full gap-5 lg:flex-row flex-col">
          <Sidebar 
            userName={userName}
            membershipLabel={membershipLabel}
            statusLabel={statusLabel}
            initials={initials}
          />

          <div className="flex-1 min-w-0 flex flex-col relative h-full">
            <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar lg:py-0 py-4">
              <header className="sticky top-0 z-20 bg-[var(--dashboard-bg)] pb-6 flex items-center justify-between gap-4">
                <div>
                  <h1
                    className="text-[21px] tracking-[-0.3px] text-[#2a3a2a]"
                    style={{ fontFamily: '"DM Serif Display", serif' }}
                  >
                    {title}
                  </h1>
                  <p className="mt-0.5 text-[11px] text-[#6a7a6a]">{subtitle}</p>
                </div>
                <div className="flex gap-2">
                  <HeaderIcon href="/draws" icon={<Search className="h-3.5 w-3.5" />} />
                  <HeaderIcon href="/draws" icon={<Bell className="h-3.5 w-3.5" />} />
                  <HeaderIcon href="/account" icon={<User2 className="h-3.5 w-3.5" />} />
                </div>
              </header>

              <div className="pb-16">
                {children}
              </div>
            </main>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[var(--dashboard-bg)] to-transparent pointer-events-none z-10" />
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderIcon({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--dashboard-bg)] text-[#6a7a6a] transition"
      style={{ boxShadow: raisedXs }}
    >
      {icon}
    </Link>
  );
}

