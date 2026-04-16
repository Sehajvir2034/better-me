// lib/toast.ts
import type { CSSProperties } from "react";

type ToastTheme = "dark" | "light";
type ToastVariant = "water" | "nutrition" | "sleep" | "activity" | "default";

const base = (theme: ToastTheme): CSSProperties => ({
  fontFamily: "var(--font-satoshi)",
  borderRadius: "16px",
  fontSize: "14px",
  border:
    theme === "dark"
      ? "1px solid rgba(255,255,255,0.08)"
      : "1px solid rgba(0,0,0,0.08)",
  color: theme === "dark" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)",
});

const backgrounds: Record<ToastVariant, Record<ToastTheme, string>> = {
  water: { dark: "#0d1520", light: "#eff6ff" },
  nutrition: { dark: "#151a0d", light: "#f0fdf4" },
  sleep: { dark: "#13111f", light: "#faf5ff" },
  activity: { dark: "#1a110d", light: "#fff7ed" },
  default: { dark: "#13151f", light: "#ffffff" },
};

export function getToastStyle(
  variant: ToastVariant = "default",
  theme: ToastTheme = "dark",
): CSSProperties {
  return {
    ...base(theme),
    background: backgrounds[variant][theme],
  };
}
