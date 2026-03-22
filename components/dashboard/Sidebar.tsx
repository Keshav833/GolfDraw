'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { signOut } from '@/app/(auth)/actions';

const raised =
  '5px 5px 12px var(--dashboard-shadow-dark), -5px -5px 12px var(--dashboard-shadow-light)';
const raisedSm =
  '3px 3px 8px var(--dashboard-shadow-dark), -3px -3px 8px var(--dashboard-shadow-light)';
const insetShadow =
  'inset 3px 3px 7px var(--dashboard-shadow-dark), inset -3px -3px 7px var(--dashboard-shadow-light)';

interface SidebarProps {
  userName: string;
  membershipLabel: string;
  statusLabel: string;
  initials: string;
}

export function Sidebar({
  userName,
  membershipLabel,
  statusLabel,
  initials,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-[200px] flex-shrink-0 bg-[var(--dashboard-bg)] flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between lg:mb-6 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/images/GolfDraw.png"
            alt="GolfDraw"
            width={140}
            height={40}
            className="h-8 w-auto max-w-[min(100%,160px)] object-contain object-left"
            priority
          />
        </Link>

        {/* Mobile Logout */}
        <form action={signOut} className="lg:hidden">
          <button
            type="submit"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-[var(--dashboard-bg)] text-[#6a7a6a] transition hover:text-[#1a5e38]"
            style={{ boxShadow: raisedSm }}
          >
            <LogOut className="h-[15px] w-[15px]" />
          </button>
        </form>
      </div>

      <div className="hidden lg:flex lg:flex-col lg:flex-1 min-h-0 relative">
        <div className="mb-[18px] flex flex-col items-center px-1 pb-5 pt-[18px] text-center flex-shrink-0">
          <div
            className="mb-[10px] flex h-14 w-14 items-center justify-center rounded-full bg-[var(--dashboard-bg)] text-lg font-semibold text-[#1a5e38]"
            style={{ boxShadow: raised }}
          >
            {initials}
          </div>
          <div className="text-[13px] font-semibold text-[#2a3a2a]">
            {userName}
          </div>
          <div className="mt-0.5 text-[11px] text-[#6a7a6a]">
            {membershipLabel}
          </div>
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

        <nav className="flex flex-col gap-1 overflow-y-auto no-scrollbar flex-1 relative group pb-10">
          <NavLabel label="Main" />
          <NavItem
            href="/dashboard"
            label="Overview"
            active={pathname === '/dashboard'}
          />
          <NavItem
            href="/scores"
            label="My Scores"
            active={pathname === '/scores'}
          />
          <NavItem href="/draws" label="Draws" active={pathname === '/draws'} />
          <NavItem
            href="/charity"
            label="Charity"
            active={pathname === '/charity'}
          />
          <NavLabel label="Account" />
          <NavItem
            href="/account"
            label="Billing"
            active={pathname === '/account' || pathname === '/register/plan'}
          />
          <NavItem
            href="/account/profile"
            label="Profile"
            active={pathname === '/account/profile'}
          />
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[var(--dashboard-bg)] to-transparent pointer-events-none sticky z-10" />
        </nav>

        <div className="mt-auto pt-4 flex-shrink-0">
          <div className="my-3 h-px bg-gradient-to-r from-transparent via-[var(--dashboard-shadow-dark)] to-transparent opacity-50" />

          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-[9px] rounded-[12px] px-3 py-[12px] text-[13px] text-[#6a7a6a] hover:text-[#1a5e38] transition-all bg-[var(--dashboard-bg)] hover:shadow-[3px_3px_8px_var(--dashboard-shadow-dark),-3px_-3px_8px_var(--dashboard-shadow-light)] active:shadow-[inset_2px_2px_5px_var(--dashboard-shadow-dark),inset_-2px_-2px_5px_var(--dashboard-shadow-light)]"
            >
              <LogOut className="h-[15px] w-[15px]" />
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

function NavLabel({ label }: { label: string }) {
  return (
    <div className="px-2 py-[10px] text-[10px] uppercase tracking-[0.8px] text-[#9aaa9a]">
      {label}
    </div>
  );
}

function NavItem({
  href,
  label,
  active = false,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-[9px] rounded-[12px] px-3 py-[10px] text-[13px] transition ${
        active
          ? 'font-medium text-[#1a5e38]'
          : 'text-[#6a7a6a] hover:text-[#2a3a2a]'
      }`}
      style={{ boxShadow: active ? insetShadow : 'none' }}
    >
      <span className="h-[15px] w-[15px] rounded-[4px] bg-current opacity-70" />
      {label}
    </Link>
  );
}
