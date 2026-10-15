import type { ComponentPropsWithoutRef } from "react";

export type Variant = "primary" | "secondary" | "danger";

export type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: Variant;
  loading?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded-control border text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent border-accent text-surface hover:bg-accent-hover hover:border-accent-hover",
  secondary: "bg-surface border-border text-accent hover:bg-canvas",
  danger: "bg-surface border-danger text-danger hover:bg-danger-soft",
};

export function buttonClasses(variant: Variant): string {
  return `${base} ${variants[variant]}`;
}
