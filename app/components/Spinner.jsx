// app/components/Spinner.jsx
"use client";

import React from "react";

/**
 * Spinner
 * Props:
 *  - size: number or string (defaults to 40) -> sets width/height in px if number
 *  - thickness: stroke width (default 4)
 *  - className: additional tailwind classes
 *  - label: optional accessible label (defaults to "Loading")
 *  - variant: "default" | "subtle" (affects colors/opacity)
 */
export function Spinner({
  size = 40,
  thickness = 4,
  className = "",
  label = "Loading",
  variant = "default",
}) {
  const pxSize = typeof size === "number" ? `${size}px` : size;
  const colorPrimary =
    variant === "subtle" ? "text-gray-400" : "text-indigo-600";
  const colorSecondary =
    variant === "subtle" ? "text-gray-200" : "text-indigo-100";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <svg
        className={`animate-spin ${colorPrimary}`}
        width={pxSize}
        height={pxSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* subtle background ring */}
        <circle
          cx="12"
          cy="12"
          r="9"
          className={`${colorSecondary}`}
          stroke="currentColor"
          strokeWidth={thickness}
          opacity="0.35"
        />
        {/* arc */}
        <path
          d="M21 12a9 9 0 10-9 9"
          stroke="currentColor"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-100"
        />
      </svg>

      {/* visually-hidden text for screen readers */}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default Spinner;
