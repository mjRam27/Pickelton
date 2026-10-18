// web/components/AppShell.tsx
"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { House, LogOut, MessageCircle, Plus, ShieldCheck, Trophy, UserRound, Users, type LucideIcon } from "lucide-react";
import { signOut, useSession } from "../lib/session";
import { Logo } from "./Logo";
import { Avatar, Loading } from "./ui";

const NAV: Array<[string, string, LucideIcon]> = [
  ["/home", "Home", House],
  ["/clubs", "Clubs", Users],
  ["/tournaments", "Events", Trophy],
  ["/community", "Community", MessageCircle],
];

// Signed-in layout. Sends signed-out visitors (or expired sessions) to /login.
export function AppShell({ children }: { children: ReactNode }) {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (session === null) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [session, router, pathname]);

  if (!session) return <div className="centerPage"><Loading label="Opening Pickelton" /></div>;

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const link = ([href, label, Icon]: [string, string, LucideIcon]) => (
    <Link aria-current={active(href) ? "page" : undefined} className="navLink" href={href} key={href}>
      <Icon aria-hidden="true" size={20} strokeWidth={1.9} />{label}
    </Link>
  );

  async function logout() {
    await signOut();
    router.replace("/login");
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link className="shellBrand" href="/home"><Logo size={30} />Pickelton</Link>
        <Link className="btn primary" href="/matches/new"><Plus aria-hidden="true" size={18} />New match</Link>
        <nav aria-label="Main" className="navList">{NAV.map(link)}</nav>
        <nav aria-label="Account" className="navList bottom">
          {link(["/profile", "Profile & settings", UserRound])}
          {link(["/host", "Host desk", ShieldCheck])}
          <button className="navLink" onClick={logout} type="button"><LogOut aria-hidden="true" size={20} strokeWidth={1.9} />Log out</button>
          <div className="row" style={{ flexWrap: "nowrap", padding: "12px 8px 0" }}>
            <Avatar name={session.name} size={36} tone="blu" />
            <span style={{ minWidth: 0 }}>
              <strong style={{ display: "block", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.name}</strong>
              <small className="muted" style={{ fontSize: 12 }}>{session.city || session.email}</small>
            </span>
          </div>
        </nav>
      </aside>

      <header className="mobileBar">
        <Link className="shellBrand" href="/home" style={{ fontSize: 22, padding: 0 }}><Logo size={26} />Pickelton</Link>
        <Link aria-label="New match" className="btn primary small" href="/matches/new"><Plus size={16} />Match</Link>
      </header>

      <main className="main" id="main">{children}</main>

      <nav aria-label="Main" className="mobileNav">
        {[...NAV, ["/profile", "Profile", UserRound] as [string, string, LucideIcon]].map(([href, label, Icon]) => (
          <Link aria-current={active(href) ? "page" : undefined} href={href} key={href}><Icon aria-hidden="true" size={22} />{label}</Link>
        ))}
      </nav>
    </div>
  );
}
