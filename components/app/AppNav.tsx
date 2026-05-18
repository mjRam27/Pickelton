import Link from "next/link";
import { CalendarDays, ClipboardCheck, LayoutDashboard, ShieldCheck, Trophy, UserRound } from "lucide-react";

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
    <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-0">
      <Link href="/dashboard" className="font-headline text-2xl font-black text-on-surface">
        Pickelton
      </Link>
      <div className="flex flex-wrap gap-2">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-on-surface-variant transition hover:bg-primary/12 hover:text-primary"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
