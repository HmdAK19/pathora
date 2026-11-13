import type { Metadata } from "next";

import { ScenarioComparison } from "@/features/compare-scenarios";

export const metadata: Metadata = {
  title: "Compare scenarios",
  description:
    "Compare the evidence, timing, and investment behind your saved career paths.",
};

export default function CompareScenariosPage() {
  return <ScenarioComparison />;
}
