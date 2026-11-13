import Link from "next/link";

import { BrandMark } from "@/shared/ui/brand-mark";

export default function NotFound() {
  return (
    <main id="main-content" className="grid min-h-dvh place-items-center px-5">
      <div className="max-w-md text-center">
        <BrandMark className="mx-auto size-11" />
        <p className="mt-7 font-mono text-xs tracking-[0.2em] text-brand uppercase">
          404 · Unknown path
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          This future does not exist yet.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Return to your workspace and explore another possible route.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex min-h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Back to workspace
        </Link>
      </div>
    </main>
  );
}
