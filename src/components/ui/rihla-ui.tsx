"use client";

import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils/cn";

const C = {
  solar: "#C8831A",
  nile: "#0F3D3E",
  faience: "#2E9C93",
  copper: "#8A5A34",
  safe: "#2E7A54",
  amber: "#D98E2C",
  red: "#B23A2E",
};

// Brand primary button — solar "keyhole" CTA
export function RihlaButton({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ai" | "ghost" | "danger";
}) {
  const styles: Record<string, { bg: string; color: string; border?: string }> = {
    primary: { bg: C.solar, color: "#141008" },
    secondary: { bg: "color-mix(in srgb, var(--surface) 60%, transparent)", color: "var(--fg-body)" },
    ai: { bg: C.faience, color: "#0B2F30" },
    ghost: { bg: "transparent", color: "var(--fg-body)" },
    danger: { bg: C.red, color: "#FFFFFF" },
  };
  const s = styles[variant];
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 font-body text-sm font-semibold transition-all",
        className
      )}
      style={{
        background: s.bg,
        color: s.color,
        boxShadow: variant === "primary" ? "0 3px 14px rgba(200,131,26,0.35)" : undefined,
        cursor: "pointer",
        border: "none",
      }}
    >
      {children}
    </button>
  );
}

// Focused input field — the "WebField" pattern
export function WebField({
  label,
  containerClassName = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; containerClassName?: string }) {
  const [f, setF] = useState(false);
  return (
    <div className={containerClassName}>
      {label && (
        <label style={{ fontFamily: "var(--font-heading)", fontSize: "13px", fontWeight: 500, color: "var(--fg-body)", display: "block", marginBottom: 7 }} className="opacity-90">
          {label}
        </label>
      )}
      <div
        style={{
          background: f ? "#fff" : "color-mix(in srgb, var(--surface) 70%, transparent)",
          border: `1.5px solid ${f ? C.solar : "color-mix(in srgb, var(--border) 70%, transparent)"}`,
          borderRadius: 10,
          padding: "12px 14px",
          boxShadow: f ? "0 0 0 3px rgba(246,131,26,0.12)" : "none",
          transition: "all 0.2s",
        }}
      >
        <input
          {...props}
          onFocus={(e) => {
            setF(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setF(false);
            props.onBlur?.(e);
          }}
          style={{
            background: "transparent",
            border: "none",
            outline: "none",
            fontFamily: "var(--font-body)",
            fontSize: "15px",
            color: "var(--fg-body)",
            width: "100%",
            boxShadow: "none",
          }}
        />
      </div>
    </div>
  );
}

// Status chip — maps a concept to its design color
export function StatusChip({
  tone,
  children,
}: {
  tone: "safe" | "caution" | "danger" | "local" | "ai" | "reward";
  children: ReactNode;
}) {
  const map = {
    safe: C.safe,
    caution: C.amber,
    danger: C.red,
    local: "#C4623A",
    ai: C.faience,
    reward: C.copper,
  };
  const color = map[tone];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color, border: `1px solid color-mix(in srgb, ${color} 35%, transparent)` }}
    >
      {children}
    </span>
  );
}