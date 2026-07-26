"use client";

import { Bell, Search } from "lucide-react";
import "./header.css";

interface HeaderProps {
  title?: string;
  userName?: string;
  avatarInitial?: string;
  onSearchChange?: (value: string) => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
}

export default function Header({
  title = "Dashboard",
  userName = "AmruthaVashini",
  avatarInitial = "A",
  onSearchChange,
  onNotificationClick,
  onProfileClick,
}: HeaderProps) {
  return (
    <header className="partner-header">
      {/* Left Section: Visible Page Title */}
      <div className="header-left">
        <h1>{title}</h1>
      </div>

      {/* Right Section: Controls & User Profile */}
      <div className="header-right">
        {/* Search Input */}
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
          onClick={onNotificationClick}
        >
          <Bell size={19} aria-hidden="true" />
          <span className="notification-dot" aria-hidden="true" />
        </button>

        {/* Profile Action */}
        <button
          type="button"
          className="header-profile"
          aria-label={`Open profile for ${userName}`}
          onClick={onProfileClick}
        >
          <div className="header-avatar" aria-hidden="true">
            {avatarInitial}
          </div>

          <div className="header-profile-copy">
            <strong>{userName}</strong>
          </div>
        </button>
      </div>
    </header>
  );
}