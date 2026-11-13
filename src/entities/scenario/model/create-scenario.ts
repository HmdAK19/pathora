import type { ScenarioDraft } from "./scenario-draft";
import type { CareerScenario } from "./scenario";

interface CreateScenarioOptions {
  id: string;
  timestamp: string;
}

export function createCareerScenario(
  draft: ScenarioDraft,
  { id, timestamp }: CreateScenarioOptions,
): CareerScenario {
  return {
    ...draft,
    id,
    title: draft.title.trim(),
    role: draft.role.trim(),
    destination: draft.destination.trim(),
    assumptions: { ...draft.assumptions },
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
