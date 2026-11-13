import type { Metadata } from "next";

import { ScenarioLibrary } from "@/features/manage-scenarios";

export const metadata: Metadata = {
  title: "Scenario library",
  description: "Review, select, and manage your saved decision scenarios.",
};

export default function ScenariosPage() {
  return <ScenarioLibrary />;
}
