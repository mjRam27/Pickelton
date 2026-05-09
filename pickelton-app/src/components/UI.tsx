import React from "react";
import { cn } from "../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "launch";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = "primary", 
  size = "md", 
  className, 
  children, 
  ...props 
}) => {
  const variants = {
    primary: "bg-secondary text-black font-headline font-black shadow-[0_8px_24px_rgba(184,246,0,0.25)]",
    secondary: "bg-primary text-black font-headline font-bold",
    tertiary: "bg-surface-highest text-primary font-headline font-bold border border-white/5",
    launch: "bg-gradient-to-br from-secondary to-[#ade700] text-black font-headline font-black shadow-[0_20px_40px_rgba(184,246,0,0.3)]"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-10 py-4 text-lg"
  };

  return (
    <button 
      className={cn(
        "rounded-xl transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; className?: string; pulse?: boolean }> = ({ 
  children, 
  className,
  pulse 
}) => (
  <span className={cn(
    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
    className
  )}>
    {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>}
    {children}
  </span>
);

export const SectionHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ 
  title, 
  subtitle, 
  action 
}) => (
  <div className="flex justify-between items-end mb-6">
    <div>
      <h2 className="font-headline text-2xl font-bold uppercase tracking-tight">{title}</h2>
      {subtitle && <p className="text-on-surface-variant text-sm">{subtitle}</p>}
    </div>
    {action}
  </div>
);
