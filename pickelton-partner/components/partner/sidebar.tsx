"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChartNoAxesCombined,
  CircleUserRound,
  LayoutDashboard,
  LucideIcon,
  MapPinned,
  Settings,
  UsersRound,
} from "lucide-react";

import "./sidebar.css";

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
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* Outer Ball Outline */}
      <circle cx="16" cy="16" r="11" />

      {/* Seamless Curved Lines */}
      <path d="M7.5 10.5C11.5 12 14.5 16 14.5 21.5" />
      <path d="M24.5 21.5C20.5 20 17.5 16 17.5 10.5" />
    </svg>
  );
}

function SidebarLogo() {
  return (
    <div className="sidebar-logo">
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

function SidebarAccount() {
  return (
    <div className="sidebar-account">
      <div className="account-avatar">AV</div>

      <div className="account-copy">
        <strong>AmruthaVarshini</strong>
      </div>

      <Settings
        className="account-settings-icon"
        size={18}
        aria-hidden="true"
      />
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="partner-sidebar">
      <SidebarLogo />

      <div className="sidebar-section-label"></div>

      <nav className="sidebar-nav" aria-label="Partner navigation">
        {NAVIGATION_ITEMS.map((item) => (
          <SidebarNavLink
            key={item.href}
            item={item}
            isActive={pathname === item.href}
          />
        ))}
      </nav>

      <SidebarAccount />
    </aside>
  );
}