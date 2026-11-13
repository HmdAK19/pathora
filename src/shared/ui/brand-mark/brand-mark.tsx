import { cx } from "@/shared/lib/cx";

interface BrandMarkProps {
  className?: string;
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "relative grid size-8 place-items-center overflow-hidden rounded-[0.65rem] bg-brand text-slate-950 shadow-[0_0_24px_rgba(167,246,90,0.18)]",
        className,
      )}
    >
      <svg viewBox="0 0 32 32" className="size-5" fill="none">
        <path
          d="M8 23V9.5h7.1c4 0 6.4 2 6.4 5.3 0 3.5-2.5 5.7-6.6 5.7h-3V23H8Z"
          fill="currentColor"
        />
        <path d="m17.8 19.8 5.4 3.2" stroke="currentColor" strokeWidth="2.4" />
      </svg>
    </span>
  );
}
