"use client";

import * as React from "react";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label?: string;
  /** Zod / react-hook-form error message */
  error?: string;
  /** Helper text shown below the input when no error */
  hint?: string;
  /** Prepend a small symbol / icon node (replaces native `prefix` HTML attr) */
  prefix?: React.ReactNode;
  /** Append a small symbol / icon node */
  suffix?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      error,
      hint,
      prefix,
      suffix,
      id: idProp,
      className = "",
      required,
      ...props
    },
    ref
  ) {
    // Generate a stable id for a11y label association if none provided
    const uid = React.useId();
    const id  = idProp ?? uid;

    const errorId = `${id}-error`;
    const hintId  = `${id}-hint`;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={id}
            className="flex items-center gap-1 text-[0.52rem] uppercase tracking-[0.38em] text-text-lo"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {label}
            {required && (
              <span className="text-emerald" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {prefix && (
            <span
              className="pointer-events-none absolute left-3 text-xs text-text-lo"
              aria-hidden="true"
            >
              {prefix}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            required={required}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={
              [error && errorId, hint && hintId].filter(Boolean).join(" ") ||
              undefined
            }
            className={[
              "w-full rounded-none border bg-[oklch(10%_0.010_160)] px-3 py-2.5 text-xs text-text-hi",
              "placeholder:text-text-lo",
              "transition-all duration-200 outline-none",
              "focus:border-[oklch(72%_0.19_160/0.6)] focus:shadow-[0_0_0_1px_oklch(72%_0.19_160/0.25)]",
              error
                ? "border-[oklch(62%_0.22_25/0.50)] focus:border-[oklch(62%_0.22_25/0.8)] focus:shadow-[0_0_0_1px_oklch(62%_0.22_25/0.25)]"
                : "border-[oklch(22%_0.015_160)]",
              prefix  && "pl-8",
              suffix  && "pr-8",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />

          {suffix && (
            <span
              className="pointer-events-none absolute right-3 text-xs text-text-lo"
              aria-hidden="true"
            >
              {suffix}
            </span>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-[0.52rem] uppercase tracking-[0.32em] text-[oklch(62%_0.22_25)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {error}
          </p>
        )}
        {!error && hint && (
          <p
            id={hintId}
            className="text-[0.52rem] text-text-lo"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);
