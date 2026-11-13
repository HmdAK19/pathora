import type { ComponentProps } from "react";

import { cx } from "@/shared/lib/cx";

const variants = {
  primary:
    "bg-brand text-slate-950 hover:bg-brand-strong disabled:bg-brand/40 disabled:text-slate-700",
  secondary:
    "border border-white/10 bg-white/[0.04] text-slate-200 hover:border-white/20 hover:bg-white/[0.07] disabled:text-slate-600",
} as const;

interface ButtonProps extends ComponentProps<"button"> {
  variant?: keyof typeof variants;
}

export function Button({
  className,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
