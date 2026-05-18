"use client";

import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  primary:
    "bg-secondary text-on-secondary shadow-glow hover:bg-secondary-dim disabled:bg-[#6b840f] disabled:text-[#253005]",
  secondary:
    "bg-primary text-[#001a63] hover:bg-primary-container disabled:bg-[#46527b] disabled:text-[#101827]",
  ghost:
    "bg-transparent text-primary hover:bg-primary/10 disabled:text-on-surface-variant"
};

export function Button({
  children,
  className = "",
  disabled,
  isLoading = false,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] transition duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
