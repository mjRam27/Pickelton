"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { FormError } from "./FormError";

type PasswordFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  helperText?: string;
};

export function PasswordField({
  label,
  error,
  helperText,
  id,
  className = "",
  ...props
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const inputId = id ?? props.name;

  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">
        {label}
      </span>
      <span className="relative block">
        <input
          id={inputId}
          type={isVisible ? "text" : "password"}
          className={`min-h-12 w-full rounded-lg bg-black/38 px-4 py-3 pr-12 text-sm font-semibold text-on-surface placeholder:text-on-surface-variant/65 outline outline-1 outline-white/10 transition hover:outline-primary/30 focus:field-focus focus:outline-primary/70 ${error ? "outline-error/80" : ""} ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={helperText || error ? `${inputId}-hint` : undefined}
          {...props}
        />
        <button
          type="button"
          aria-label={isVisible ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-white/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          onClick={() => setIsVisible((current) => !current)}
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
      {helperText && !error ? (
        <p id={`${inputId}-hint`} className="mt-2 text-xs font-medium text-on-surface-variant">
          {helperText}
        </p>
      ) : null}
      <FormError message={error} />
    </label>
  );
}
