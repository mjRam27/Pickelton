"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "./header.css";

interface HeaderProps {
  title?: string;
  onNotificationClick?: () => void;
}

export default function Header({
  title = "",
  onNotificationClick,
}: HeaderProps) {
  const pathname = usePathname();
  const notificationRef = useRef<HTMLDivElement>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    setNotificationsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!notificationsOpen) return;

    function closeOnOutsideClick(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [notificationsOpen]);

  function toggleNotifications() {
    setNotificationsOpen((open) => !open);
    onNotificationClick?.();
  }

  return (
    <header className="partner-header">
      {/* Left Section: Page Title */}
      <div className="header-left">
        {title && <h1>{title}</h1>}
      </div>

      {/* Right Section: Profile and Notification */}
      <div className="header-right">
        <Link
          href="/partner/profile"
          className="header-profile"
          aria-label="View AmruthaVarshini's profile"
        >
          <span className="header-avatar" aria-hidden="true">AV</span>

          <span className="header-profile-copy">
            <strong>AmruthaVarshini</strong>
          </span>
        </Link>

        <div className="header-notification" ref={notificationRef}>
          <button
            type="button"
            className="header-icon-btn"
            aria-label="View notifications"
            aria-expanded={notificationsOpen}
            aria-controls="header-notification-panel"
            title="Notifications"
            onClick={toggleNotifications}
          >
            <Bell size={19} aria-hidden="true" />
            <span className="notification-dot" aria-hidden="true" />
          </button>

          {notificationsOpen && (
            <section
              id="header-notification-panel"
              className="notification-panel"
              aria-label="Notifications"
            >
              <h2>Notifications</h2>

              <div className="notification-empty-state">
                <Bell size={20} aria-hidden="true" />
                <p>No new notifications</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </header>
  );
}
