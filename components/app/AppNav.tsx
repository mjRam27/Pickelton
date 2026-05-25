"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarDays,
  Home,
  Menu,
  LogOut,
  ShieldCheck,
  Swords,
  Trophy,
  UserRound,
  X,
  Zap
} from "lucide-react";
import { useState } from "react";
import { logout } from "@/services/auth";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/scoring", label: "Scoring", icon: Swords },
  { href: "/tournaments", label: "Tournaments", icon: Trophy },
  { href: "/clubs", label: "Clubs", icon: Building2 },
  { href: "/booking", label: "Booking", icon: CalendarDays },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/host/register", label: "Host", icon: ShieldCheck }
];

export function AppNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  async function handleLogout() {
    await logout();
    setIsOpen(false);
    window.location.href = "/login";
  }

  return (
    <div className="sticky top-0 z-30 border-b border-white/10 bg-background/88 backdrop-blur-2xl">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-4 lg:px-0">
        <Link href="/" className="inline-flex min-w-0 items-center gap-3" onClick={() => setIsOpen(false)}>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-background sm:h-10 sm:w-10">
            <Zap className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block font-headline text-xl font-black leading-none text-on-surface sm:text-2xl">Pickelton</span>
            <span className="mt-1 block text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-primary">
              Tournament OS
            </span>
          </span>
        </Link>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-white/8 text-on-surface outline outline-1 outline-white/10 transition hover:bg-primary/12 hover:text-primary md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>

        <div className="hidden items-center gap-2 md:flex">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-xs font-extrabold uppercase tracking-[0.08em] outline outline-1 transition ${
                pathname === href || (href !== "/" && pathname.startsWith(href))
                  ? "bg-primary text-background outline-primary/40"
                  : "bg-white/[0.04] text-on-surface-variant outline-white/5 hover:bg-white/8 hover:text-on-surface hover:outline-white/15"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
          <button
            type="button"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-on-surface-variant outline outline-1 outline-white/5 transition hover:bg-error/14 hover:text-error hover:outline-error/20"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      </nav>

      {isOpen ? (
        <div className="border-t border-white/10 px-5 pb-4 md:hidden">
          <div className="mx-auto grid max-w-6xl gap-2">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`inline-flex min-h-12 items-center gap-3 rounded-lg px-4 text-sm font-extrabold uppercase tracking-[0.08em] outline outline-1 transition ${
                  pathname === href || (href !== "/" && pathname.startsWith(href))
                    ? "bg-primary text-background outline-primary/40"
                    : "bg-white/[0.04] text-on-surface-variant outline-white/5"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
            <button
              type="button"
              className="inline-flex min-h-12 items-center gap-3 rounded-lg bg-white/[0.04] px-4 text-sm font-extrabold uppercase tracking-[0.08em] text-on-surface-variant outline outline-1 outline-white/5 transition hover:bg-error/14 hover:text-error"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
