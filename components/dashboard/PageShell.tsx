'use client';

import Link from 'next/link';
import { Bell, LayoutGrid, Search, User2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

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
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <div
        className="overflow-hidden rounded-[24px] bg-[var(--dashboard-bg)] p-4 sm:p-5 lg:p-6"
        style={{ boxShadow: raised }}
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[186px_minmax(0,1fr)]">
          <aside className="rounded-[20px] bg-[var(--dashboard-bg)] p-4 lg:p-0">
            <div className="flex items-center gap-[9px] lg:mb-6">
              <div
                className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[var(--dashboard-bg)]"
                style={{ boxShadow: raisedSm }}
              >
                <LayoutGrid className="h-4 w-4 text-[#1a5e38]" />
              </div>
              <span
                className="text-[17px] text-[#2a3a2a]"
                style={{ fontFamily: '"DM Serif Display", serif' }}
              >
                GolfDraw
              </span>
            </div>

            <div className="hidden lg:block">
              <div className="mb-[18px] flex flex-col items-center px-1 pb-5 pt-[18px] text-center">
                <div
                  className="mb-[10px] flex h-14 w-14 items-center justify-center rounded-full bg-[var(--dashboard-bg)] text-lg font-semibold text-[#1a5e38]"
                  style={{ boxShadow: raised }}
                >
                  {initials}
                </div>
                <div className="text-[13px] font-semibold text-[#2a3a2a]">{userName}</div>
                <div className="mt-0.5 text-[11px] text-[#6a7a6a]">{membershipLabel}</div>
                <div
                  className="mt-2 inline-flex items-center gap-[5px] rounded-[20px] px-3 py-1 text-[10px] font-medium"
                  style={{
                    background: 'var(--dashboard-bg)',
                    boxShadow: insetShadow,
                    color: '#1a5e38',
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#1a5e38]" />
                  {statusLabel}
                </div>
              </div>

              <nav className="flex flex-col gap-1">
                <NavLabel label="Main" />
                <NavItem href="/dashboard" label="Overview" active={pathname === '/dashboard'} />
                <NavItem href="/scores" label="My Scores" active={pathname === '/scores'} />
                <NavItem href="/draws" label="Draws" active={pathname === '/draws'} />
                <NavItem href="/charity" label="Charity" active={pathname === '/charity'} />
                <NavLabel label="Account" />
                <NavItem href="/account" label="Billing" active={pathname === '/account'} />
                <NavItem href="/account" label="Profile" active={false} />
              </nav>

              <div className="my-3 h-px bg-gradient-to-r from-transparent via-[var(--dashboard-shadow-dark)] to-transparent opacity-50" />

              <NavItem href="/account" label="Manage account" active={false} />
            </div>
          </aside>

          <main className="min-w-0">
            <header className="mb-6 flex items-center justify-between gap-4">
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

            {children}
          </main>
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

function NavLabel({ label }: { label: string }) {
  return <div className="px-2 py-[10px] text-[10px] uppercase tracking-[0.8px] text-[#9aaa9a]">{label}</div>;
}

function NavItem({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-[9px] rounded-[12px] px-3 py-[10px] text-[13px] transition ${
        active ? 'font-medium text-[#1a5e38]' : 'text-[#6a7a6a] hover:text-[#2a3a2a]'
      }`}
      style={{ boxShadow: active ? insetShadow : 'none' }}
    >
      <span className="h-[15px] w-[15px] rounded-[4px] bg-current opacity-70" />
      {label}
    </Link>
  );
}
