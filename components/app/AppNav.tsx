import Link from "next/link";
import { CalendarDays, ClipboardCheck, LayoutDashboard, ShieldCheck, Trophy, UserRound, Zap } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Browse", icon: LayoutDashboard },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/booking", label: "Booking", icon: CalendarDays },
  { href: "/host/register", label: "Host", icon: ShieldCheck },
  { href: "/tournaments/create", label: "Tournament", icon: Trophy },
  { href: "/admin/hosts", label: "Admin", icon: ClipboardCheck }
];

export function AppNav() {
  return (
    <div className="sticky top-0 z-30 border-b border-white/5 bg-background/72 backdrop-blur-2xl">
      <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-0">
        <Link href="/dashboard" className="inline-flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-on-secondary">
            <Zap className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block font-headline text-2xl font-black leading-none text-on-surface">Pickelton</span>
            <span className="mt-1 block text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-primary">
              Tournament OS
            </span>
          </span>
        </Link>
        <div className="flex flex-wrap gap-2">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-on-surface-variant outline outline-1 outline-white/5 transition hover:bg-primary/12 hover:text-primary hover:outline-primary/25"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
