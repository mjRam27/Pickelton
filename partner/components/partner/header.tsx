"use client";

import { Bell, Search } from "lucide-react";
import "./header.css";

interface HeaderProps {
  title?: string;
  onSearchChange?: (value: string) => void;
  onNotificationClick?: () => void;
}

export default function Header({
  title = "",
  onSearchChange,
  onNotificationClick,
}: HeaderProps) {
  return (
    <header className="partner-header">
      {/* Left Section: Page Title */}
      <div className="header-left">
        {title && <h1>{title}</h1>}
      </div>

      {/* Right Section: Search & Notification Only */}
      <div className="header-right">
        {/* Search Bar */}
        <label className="search-box">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search..."
            aria-label="Search"
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </label>

        {/* Notification Action */}
        <button
          type="button"
          className="header-icon-btn"
          aria-label="View notifications"
          title="Notifications"
          onClick={onNotificationClick}
        >
          <Bell size={19} aria-hidden="true" />
          <span className="notification-dot" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}