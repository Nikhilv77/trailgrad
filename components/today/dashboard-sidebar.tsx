"use client";

import { SignOutButton } from "@clerk/nextjs";
import {
  ChevronLeft,
  Ellipsis,
  LogOut,
  Menu,
  PanelLeftOpen,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { SiteBrand } from "@/components/marketing/site-brand";
import { SIGN_OUT_REDIRECT_URL } from "@/lib/auth/routes";

import { mockDashboard, navigationGroups, type NavItem } from "./dashboard-data";

const hasClerkPublishableKey = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
);

export function DashboardSidebar({
  collapsed,
  firstName,
  imageUrl,
  onCloseMobile,
  onToggle,
}: {
  collapsed: boolean;
  firstName: string;
  imageUrl: string | null;
  onCloseMobile: () => void;
  onToggle: () => void;
}) {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountFooterRef = useRef<HTMLDivElement>(null);
  const initials = getInitials(firstName);

  useEffect(() => {
    if (!accountMenuOpen) return;

    function closeOnOutsidePress(event: PointerEvent) {
      if (!accountFooterRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setAccountMenuOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountMenuOpen]);

  return (
    <div className="flex min-h-0 flex-1 flex-col px-3 py-5">
      <div
        className={`relative flex h-12 items-center ${
          collapsed ? "justify-center" : "justify-between px-2"
        }`}
      >
        {collapsed ? (
          <Link
            href="/today"
            className="grid size-10 cursor-pointer place-items-center rounded-md transition-colors hover:bg-[#f4f8f7]"
            aria-label="Trailgrad dashboard"
            title="Trailgrad"
          >
            <Image
              src="/images/brand/trailgrad-logo.png"
              alt=""
              width={36}
              height={36}
              className="size-8 object-contain"
              priority
            />
          </Link>
        ) : (
          <SiteBrand iconFrame={false} />
        )}
        <button
          type="button"
          onClick={() => {
            setAccountMenuOpen(false);
            onToggle();
          }}
          className="absolute -right-[27px] top-1/2 z-10 hidden size-7 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-[#b9e7df] bg-white text-[#738098] transition-colors hover:border-[#75cfc1] hover:text-[#078f7c] lg:grid"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-3.5" />
          ) : (
            <ChevronLeft className="size-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          className="grid size-9 cursor-pointer place-items-center text-[#61708a] lg:hidden"
          aria-label="Close navigation"
        >
          <X className="size-5" />
        </button>
      </div>

      <nav
        className="tg-slim-scrollbar mt-7 min-h-0 flex-1 overflow-y-auto overflow-x-hidden"
        aria-label="Dashboard navigation"
      >
        <div className="space-y-7">
          {navigationGroups.map((group, groupIndex) => (
            <div key={group.label}>
              {!collapsed ? (
                <p className="mb-2.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#98a2b3]">
                  {group.label}
                </p>
              ) : groupIndex > 0 ? (
                <div className="mx-auto mb-3 w-6 border-t border-[#cdeee8]" />
              ) : null}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.label}
                    item={item}
                    active={item.label === "Overview"}
                    collapsed={collapsed}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={`${collapsed ? "mx-auto w-6" : "mx-3"} my-5 border-t border-[#cdeee8]`} />
        {!collapsed ? (
          <p className="mb-2.5 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#98a2b3]">
            Account
          </p>
        ) : null}
        <SidebarItem
          item={{ icon: Settings, label: "Settings" }}
          collapsed={collapsed}
          href="/profile"
        />
      </nav>

      <div
        ref={accountFooterRef}
        className="relative mt-4 border-t border-[#cdeee8] pt-4"
      >
        {accountMenuOpen ? (
          <div
            className={`absolute bottom-[calc(100%+10px)] z-20 rounded-lg border border-[#d9e1e6] bg-white p-1.5 ${
              collapsed ? "left-0 w-[216px]" : "inset-x-0"
            }`}
            role="menu"
            aria-label="Account menu"
          >
            <div className="flex items-center gap-3 border-b border-[#e8ecef] px-2.5 py-3">
              <AccountAvatar
                firstName={firstName}
                imageUrl={imageUrl}
                initials={initials}
                size="medium"
              />
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-semibold leading-4 text-[#243550]">
                  {firstName}
                </span>
                <span className="mt-0.5 block truncate text-[11px] leading-4 text-[#8791a2]">
                  {mockDashboard.targetRole}
                </span>
              </span>
            </div>
            <Link
              href="/profile"
              role="menuitem"
              className="mt-1 flex h-9 cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-[12px] font-medium text-[#53627a] transition-colors hover:bg-[#f5f8f7] hover:text-[#172943]"
            >
              <UserRound className="size-4 text-[#718099]" />
              Profile settings
            </Link>
            <DashboardSignOutControl className="flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 text-[12px] font-medium text-[#53627a] transition-colors hover:bg-[#fff5f4] hover:text-[#c94a3f]">
              <LogOut className="size-4" />
              Sign out
            </DashboardSignOutControl>
          </div>
        ) : null}

        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "gap-3 px-1.5 py-2"
          }`}
        >
          <button
            type="button"
            onClick={() => setAccountMenuOpen((open) => !open)}
            className="grid size-[52px] shrink-0 cursor-pointer place-items-center rounded-full transition-opacity hover:opacity-90"
            aria-expanded={accountMenuOpen}
            aria-haspopup="menu"
            aria-label="Open account menu"
            title={collapsed ? firstName : undefined}
          >
            <AccountAvatar
              firstName={firstName}
              imageUrl={imageUrl}
              initials={initials}
              size="default"
            />
          </button>

          {!collapsed ? (
            <>
              <Link href="/profile" className="min-w-0 flex-1 cursor-pointer rounded-md px-1 py-1.5">
                <span className="block truncate text-[15px] font-semibold leading-5 text-[#172943]">
                  {firstName}
                </span>
                <span className="mt-0.5 block truncate text-[12px] leading-4 text-[#7d889a]">
                  {mockDashboard.targetRole}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setAccountMenuOpen((open) => !open)}
                className={`grid size-9 shrink-0 cursor-pointer place-items-center rounded-md transition-colors ${
                  accountMenuOpen
                    ? "bg-[#edf5f3] text-[#087e6f]"
                    : "text-[#8a95a5] hover:bg-[#f3f6f5] hover:text-[#334a67]"
                }`}
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                aria-label="Open account menu"
                title="Account menu"
              >
                <Ellipsis className="size-5" />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function MobileHeader({ onOpen }: { onOpen: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#b9e7df] bg-white/95 px-4 backdrop-blur lg:hidden">
      <SiteBrand compact iconFrame={false} />
      <button
        type="button"
        onClick={onOpen}
        className="grid size-10 cursor-pointer place-items-center rounded-md border border-[#b9e7df] text-[#263a5b]"
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </button>
    </header>
  );
}

function SidebarItem({
  item,
  active = false,
  collapsed,
  href,
}: {
  item: NavItem;
  active?: boolean;
  collapsed: boolean;
  href?: string;
}) {
  const Icon = item.icon;
  const className = `group relative flex h-[42px] w-full cursor-pointer items-center rounded-[7px] text-[13px] transition-colors ${
    collapsed ? "justify-center px-0" : "gap-3 px-3"
  } ${
    active
      ? "bg-[#eef8f5] font-bold text-[#078f7c] before:absolute before:left-0 before:top-2.5 before:h-[22px] before:w-[3px] before:rounded-r-full before:bg-[#079985]"
      : "font-semibold text-[#53627a] hover:bg-[#f6f8f8] hover:text-[#162844]"
  }`;
  const content = (
    <>
      <Icon
        className={`size-[18px] shrink-0 ${
          active ? "text-[#079985]" : "text-[#697991] group-hover:text-[#334b6a]"
        }`}
        strokeWidth={1.8}
      />
      {!collapsed ? <span>{item.label}</span> : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={className}
        title={collapsed ? item.label : undefined}
        aria-current={active ? "page" : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
    >
      {content}
    </button>
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function AccountAvatar({
  firstName,
  imageUrl,
  initials,
  size,
}: {
  firstName: string;
  imageUrl: string | null;
  initials: string;
  size: "small" | "medium" | "default";
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const sizeClass =
    size === "small"
      ? "size-8 text-[10px]"
      : size === "medium"
        ? "size-10 text-[11px]"
        : "size-[52px] text-[13px]";

  if (imageUrl && !imageFailed) {
    return (
      <span
        className={`block overflow-hidden rounded-full border border-[#d5e0dd] bg-[#edf6f4] ${sizeClass}`}
      >
        {/* Clerk image URLs may use different CDN hosts per environment. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={`${firstName}'s profile`}
          className="size-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      </span>
    );
  }

  return (
    <span
      className={`grid place-items-center rounded-full bg-[#123e39] font-bold text-white ${sizeClass}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

function DashboardSignOutControl({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  if (!hasClerkPublishableKey) {
    return (
      <a
        href={SIGN_OUT_REDIRECT_URL}
        className={className}
        role="menuitem"
      >
        {children}
      </a>
    );
  }

  return (
    <SignOutButton redirectUrl={SIGN_OUT_REDIRECT_URL}>
      <button type="button" className={className} role="menuitem">
        {children}
      </button>
    </SignOutButton>
  );
}
