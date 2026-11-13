import type { Metadata } from "next";
import { Suspense } from "react";

import { ScenarioComposer } from "@/features/create-scenario";

export const metadata: Metadata = {
  title: "Create a scenario",
  description:
    "Define a decision path, state its assumptions, and create a transparent forecast.",
};

function ComposerFallback() {
  return (
    <main id="main-content" className="grid min-h-dvh place-items-center px-4">
      <p className="text-sm text-muted">Preparing the scenario composer…</p>
    </main>
  );
}

export default function NewScenarioPage() {
  return (
    <Suspense fallback={<ComposerFallback />}>
      <ScenarioComposer />
    </Suspense>
  );
}
