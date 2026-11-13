"use client";

import { useEffect } from "react";

import { BrandMark } from "@/shared/ui/brand-mark";
import { Button } from "@/shared/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content" className="grid min-h-dvh place-items-center px-5">
      <div className="max-w-md text-center">
        <BrandMark className="mx-auto size-11" />
        <p className="mt-7 font-mono text-xs tracking-[0.2em] text-brand uppercase">
          Model interrupted
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          We lost this path for a moment.
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Your scenario is still safe. Retry the current view to reconnect it.
        </p>
        <Button className="mt-7" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
