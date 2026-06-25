"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomNavProps {
  onAdd: () => void;
  hasPhotos: boolean;
}

function NavIcon({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`flex h-6 w-6 items-center justify-center ${className}`}>
      {children}
    </span>
  );
}

function AddIcon() {
  return (
    <NavIcon>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </NavIcon>
  );
}

function FeedIcon() {
  return (
    <NavIcon>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    </NavIcon>
  );
}

function GridIcon() {
  return (
    <NavIcon>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    </NavIcon>
  );
}

interface NavItemProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  accent?: boolean;
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
}

function NavItem({ label, active, disabled, accent, href, onClick, icon }: NavItemProps) {
  const className = `flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-2 transition-colors ${
    disabled ? "pointer-events-none opacity-30" : ""
  } ${
    active
      ? "bg-[var(--nav-active-bg)] text-[var(--foreground)]"
      : accent
        ? "text-[var(--accent)]"
        : "text-[var(--nav-inactive)] active:text-[var(--foreground)]"
  }`;

  const content = (
    <>
      {icon}
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} aria-label={label} aria-current={active ? "page" : undefined} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className={className}
    >
      {content}
    </button>
  );
}

export function BottomNav({ onAdd, hasPhotos }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 sm:hidden"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-sm items-center justify-between rounded-[22px] border border-[var(--nav-bar-border)] bg-[var(--nav-bar)] px-1 py-1 shadow-[var(--nav-shadow)] backdrop-blur-2xl">
        <NavItem label="Add" icon={<AddIcon />} accent onClick={onAdd} />
        <NavItem
          label="Feed"
          icon={<FeedIcon />}
          href="/feed"
          active={hasPhotos && pathname === "/feed"}
          disabled={!hasPhotos}
        />
        <NavItem
          label="Gallery"
          icon={<GridIcon />}
          href="/gallery"
          active={hasPhotos && pathname === "/gallery"}
          disabled={!hasPhotos}
        />
      </div>
    </nav>
  );
}
