"use client";

import type { SelectHTMLAttributes } from "react";
import { FormError } from "./FormError";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  helperText?: string;
  options: Array<{ label: string; value: string }>;
};

export function SelectField({
  label,
  error,
  helperText,
  id,
  options,
  className = "",
  ...props
}: SelectFieldProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block" htmlFor={inputId}>
      <span className="mb-2 block text-xs font-extrabold uppercase tracking-[0.14em] text-on-surface-variant">
        {label}
      </span>
      <select
        id={inputId}
        className={`min-h-12 w-full rounded-lg bg-black/72 px-4 py-3 text-sm font-semibold text-on-surface outline outline-1 outline-outline/40 transition focus:field-focus focus:outline-primary/70 ${error ? "outline-error/80" : ""} ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={helperText || error ? `${inputId}-hint` : undefined}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && !error ? (
        <p id={`${inputId}-hint`} className="mt-2 text-xs font-medium text-on-surface-variant">
          {helperText}
        </p>
      ) : null}
      <FormError message={error} />
    </label>
  );
}
