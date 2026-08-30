"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  ChartNoAxesCombined,
  CircleUserRound,
  LayoutDashboard,
  LogOut,
  LucideIcon,
  MapPinned,
  Settings,
  UsersRound,
} from "lucide-react";

import "./sidebar.css";
import { createClient } from "@/lib/supabase/client";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const NAVIGATION_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/partner/dashboard", icon: LayoutDashboard },
  { label: "Courts", href: "/partner/courts", icon: MapPinned },
  { label: "Bookings", href: "/partner/bookings", icon: CalendarDays },
  { label: "Customers", href: "/partner/customers", icon: UsersRound },
  { label: "Reports", href: "/partner/reports", icon: ChartNoAxesCombined },
  { label: "Profile", href: "/partner/profile", icon: CircleUserRound },
  { label: "Settings", href: "/partner/settings", icon: Settings },
];

function PickeltonLogoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <ellipse
        cx="13.2"
        cy="12.8"
        rx="5.6"
        ry="7.2"
        strokeWidth="2.4"
        transform="rotate(-38 13.2 12.8)"
      />
      <path d="m17.4 18.1 4.1 4.1" strokeWidth="2.5" />
      <path d="m20.6 21.3 2.7 2.7" strokeWidth="4" />
      <circle cx="23.8" cy="7.7" r="2.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SidebarLogo({ animate }: { animate: boolean }) {
  return (
    <div className={`sidebar-logo${animate ? " sidebar-logo-intro" : ""}`}>
      <span className="sidebar-logo-mark" aria-hidden="true">
        <PickeltonLogoIcon width={24} height={24} />
      </span>

      <div className="sidebar-wordmark">
        <strong>Pickelton</strong>
        <span>PARTNER</span>
      </div>
    </div>
  );
}

function SidebarNavLink({
  item,
  isActive,
}: {
  item: NavItem;
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={isActive ? "active" : ""}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="nav-icon" aria-hidden="true">
        <Icon size={20} strokeWidth={1.9} />
      </span>

      <span className="nav-label">{item.label}</span>

      <span className="active-indicator" aria-hidden="true" />
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [animateLogo, setAnimateLogo] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    if (logoutLoading) return;
    setLogoutLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        await supabase.auth.signOut({ scope: "local" });
        console.error("Supabase logout returned an error; the local session was cleared.", error);
      }
    } catch (error) {
      console.error("Supabase logout failed; clearing the local partner session.", error);
    } finally {
      for (const key of ["partner_token", "token", "accessToken", "access_token"]) {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      }
      router.replace("/partner/login");
      router.refresh();
    }
  };

  useEffect(() => {
    if (pathname !== "/partner/dashboard") return;

    const animationKey = "pickelton-partner-logo-intro";

    if (!sessionStorage.getItem(animationKey)) {
      sessionStorage.setItem(animationKey, "complete");
      setAnimateLogo(true);
    }
  }, [pathname]);

  return (
    <aside className="partner-sidebar">
      <SidebarLogo animate={animateLogo} />

      <div className="sidebar-section-label"></div>

      <nav className="sidebar-nav" aria-label="Partner navigation">
        {NAVIGATION_ITEMS.map((item) => (
          <SidebarNavLink
            key={item.href}
            item={item}
            isActive={
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`)
            }
          />
        ))}
        <button className="sidebar-logout" type="button" onClick={handleLogout} disabled={logoutLoading}>
          <span className="nav-icon" aria-hidden="true"><LogOut size={20} strokeWidth={1.9}/></span>
          <span className="nav-label">{logoutLoading ? "Logging out…" : "Logout"}</span>
        </button>
      </nav>

    </aside>
  );
}
