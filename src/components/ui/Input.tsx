"use client";

import { InputHTMLAttributes, SelectHTMLAttributes, forwardRef } from "react";

interface FieldWrapperProps {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export function FieldWrapper({ label, error, children }: FieldWrapperProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-text-secondary">{label}</span>}
      {children}
      {error && <span className="text-xs text-critical">{error}</span>}
    </label>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => (
    <FieldWrapper label={label} error={error}>
      <input
        ref={ref}
        className={`rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-text-primary outline-none transition-shadow placeholder:text-text-muted focus:ring-2 focus:ring-accent/40 ${
          error ? "border-critical" : ""
        } ${className}`}
        {...props}
      />
    </FieldWrapper>
  ),
);
Input.displayName = "Input";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = "", children, ...props }, ref) => (
    <FieldWrapper label={label} error={error}>
      <select
        ref={ref}
        className={`rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-text-primary outline-none transition-shadow focus:ring-2 focus:ring-accent/40 ${className}`}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  ),
);
Select.displayName = "Select";
