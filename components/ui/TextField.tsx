"use client";

import type { InputHTMLAttributes } from "react";
import { FormError } from "./FormError";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  helperText?: string;
};

export function TextField({ label, error, helperText, id, className = "", ...props }: TextFieldProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">
        {label}
      </span>
      <input
        id={inputId}
        className={`min-h-12 w-full rounded-lg bg-black/38 px-4 py-3 text-sm font-semibold text-on-surface placeholder:text-on-surface-variant/65 outline outline-1 outline-white/10 transition hover:outline-primary/30 focus:field-focus focus:outline-primary/70 ${error ? "outline-error/80" : ""} ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={helperText || error ? `${inputId}-hint` : undefined}
        {...props}
      />
      {helperText && !error ? (
        <p id={`${inputId}-hint`} className="mt-2 text-xs font-medium text-on-surface-variant">
          {helperText}
        </p>
      ) : null}
      <FormError message={error} />
    </label>
  );
}
