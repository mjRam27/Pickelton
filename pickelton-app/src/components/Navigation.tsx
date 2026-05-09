import React from "react";
import { Screen } from "../types";
import { cn } from "../lib/utils";

interface BottomNavBarProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeScreen, onNavigate }) => {
  const navItems = [
    { id: "home", label: "Home", icon: "grid_view" },
    { id: "book", label: "Book", icon: "calendar_today" },
    { id: "live", label: "Live", icon: "sensors" },
    { id: "feed", label: "Feed", icon: "amp_stories" },
    { id: "profile", label: "Profile", icon: "person" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-[#0e0e0e]/80 backdrop-blur-xl flex justify-around items-center px-4 pb-6 pt-3 rounded-t-2xl shadow-[0px_-12px_32px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => {
        const isActive = activeScreen === item.id || (item.id === 'live' && activeScreen === 'live-telecast');
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as Screen)}
            className={cn(
              "flex flex-col items-center justify-center transition-all duration-300 ease-out",
              isActive 
                ? "text-secondary bg-secondary/10 rounded-xl px-4 py-1 scale-110" 
                : "text-primary/50 hover:text-secondary"
            )}
          >
            <span className={cn("material-symbols-outlined", isActive && "fill-1")}>
              {item.icon}
            </span>
            <span className="font-body text-[10px] font-bold uppercase tracking-widest mt-1">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

interface TopAppBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  onAction?: () => void;
  actionIcon?: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ 
  title = "KINETIC", 
  showBack, 
  onBack,
  onAction,
  actionIcon = "notifications"
}) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#0e0e0e]/80 backdrop-blur-xl flex justify-between items-center px-6 py-4 shadow-[0px_24px_48px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-4">
        {showBack ? (
          <button onClick={onBack} className="text-primary scale-95 active:duration-150">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        ) : (
          <button className="text-primary scale-95 active:duration-150">
            <span className="material-symbols-outlined">menu</span>
          </button>
        )}
        <h1 className="text-2xl font-headline font-black tracking-tighter text-primary uppercase italic">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={onAction} className="text-primary scale-95 active:duration-150 relative">
          <span className="material-symbols-outlined">{actionIcon}</span>
          {actionIcon === "notifications" && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-secondary rounded-full"></span>
          )}
        </button>
      </div>
    </header>
  );
};
