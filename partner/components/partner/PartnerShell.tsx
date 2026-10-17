// partner/components/partner/PartnerShell.tsx
"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, CalendarDays, ChartNoAxesCombined, LayoutDashboard, LogOut, Settings, SquareDashed, UsersRound, type LucideIcon } from "lucide-react";
import type { Partner } from "@pickelton/types";
import { clearSession, errorMessage, getToken, isUnauthorized, partnerApi } from "../../lib/partner";
import { Avatar, LoadError, Loading, Logo } from "../ui";

const PartnerContext = createContext<{ partner: Partner; setPartner: (partner: Partner) => void } | null>(null);

export function usePartner() {
  const value = useContext(PartnerContext);
  if (!value) throw new Error("usePartner must be used inside PartnerShell");
  return value;
}

const MAIN_NAV: Array<[string, string, LucideIcon]> = [
  ["/partner/dashboard", "Dashboard", LayoutDashboard],
  ["/partner/courts", "Courts", SquareDashed],
  ["/partner/bookings", "Bookings", CalendarDays],
  ["/partner/customers", "Customers", UsersRound],
  ["/partner/reports", "Reports", ChartNoAxesCombined],
];
const ACCOUNT_NAV: Array<[string, string, LucideIcon]> = [
  ["/partner/profile", "Venue profile", Building2],
  ["/partner/settings", "Settings", Settings],
];

// Guards the portal: no token or an expired one sends the user to log in.
export function PartnerShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [error, setError] = useState("");

  async function load() {
    if (!getToken()) {
      router.replace("/partner/login");
      return;
    }
    setError("");
    try {
      setPartner(await partnerApi.auth.me());
    } catch (cause) {
      if (isUnauthorized(cause)) {
        clearSession();
        router.replace("/partner/login");
      } else {
        setError(errorMessage(cause));
      }
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void load(); }, []);

  function signOut() {
    clearSession();
    router.replace("/partner/login");
  }

  if (!partner) {
    return <div className="authGate">{error ? <LoadError message={error} onRetry={load} /> : <Loading label="Opening your portal" />}</div>;
  }

  const link = ([href, label, Icon]: [string, string, LucideIcon]) => {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link aria-current={active ? "page" : undefined} className="navLink" href={href} key={href}>
        <Icon aria-hidden="true" size={20} strokeWidth={1.9} />{label}
      </Link>
    );
  };

  return (
    <PartnerContext.Provider value={{ partner, setPartner }}>
      <div className="shell">
        <aside className="sidebar">
          <Link className="brand" href="/partner/dashboard"><Logo size={30} />Pickelton<span className="partnerTag">PARTNER</span></Link>
          <div className="venueCard">
            <Avatar name={partner.business_name} square tone="acc" />
            <span style={{ minWidth: 0 }}>
              <strong>{partner.business_name}</strong>
              <small>{partner.city || partner.email}</small>
            </span>
          </div>
          <nav aria-label="Portal" className="navList">{MAIN_NAV.map(link)}</nav>
          <nav aria-label="Account" className="navList bottom">
            {ACCOUNT_NAV.map(link)}
            <button className="navLink" onClick={signOut} type="button"><LogOut aria-hidden="true" size={20} strokeWidth={1.9} />Log out</button>
            <div className="who" style={{ padding: "12px 8px 0" }}>
              <Avatar name={partner.contact_name} tone="hot" />
              <span><strong>{partner.contact_name}</strong><small>{partner.email}</small></span>
            </div>
          </nav>
        </aside>
        <main className="main" id="main">{children}</main>
      </div>
    </PartnerContext.Provider>
  );
}
