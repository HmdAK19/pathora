import type { CareerScenario } from "@/entities/scenario";

import type { EvidenceBundle, EvidenceRepository } from "./evidence";

const demandLabel = (demand: number) => {
  if (demand >= 70) return "Strong";
  if (demand >= 40) return "Moderate";
  return "Limited";
};

export function createDemoEvidenceBundle(
  scenario: CareerScenario,
  generatedAt = new Date().toISOString(),
): EvidenceBundle {
  const consistency = Math.min(
    100,
    Math.round(scenario.assumptions.weeklyHours * 7),
  );
  const monthlyHours = Math.round(scenario.assumptions.weeklyHours * 4.33);

  return {
    generatedAt,
    scenarioId: scenario.id,
    status: "modeled",
    signals: [
      {
        id: "skill-coverage",
        label: "Skill coverage",
        value: `${scenario.assumptions.currentReadiness}%`,
        source: "Scenario self-assessment",
        methodology: "Direct input; not independently verified yet.",
        confidence: "low",
        freshness: "prototype",
      },
      {
        id: "market-demand",
        label: "Market demand",
        value: demandLabel(scenario.assumptions.marketDemand),
        source: "Prototype market index",
        methodology: `Normalized scenario input: ${scenario.assumptions.marketDemand}/100.`,
        confidence: "medium",
        freshness: "prototype",
      },
      {
        id: "learning-capacity",
        label: "Learning capacity",
        value: `${monthlyHours}h / month`,
        source: "Weekly commitment model",
        methodology: "Weekly hours × 4.33 average weeks per month.",
        confidence: "high",
        freshness: "prototype",
      },
      {
        id: "plan-consistency",
        label: "Plan consistency",
        value: `${consistency}%`,
        source: "Pathora consistency heuristic",
        methodology: "Weekly commitment × 7, capped at 100.",
        confidence: "medium",
        freshness: "prototype",
      },
    ],
  };
}

export const demoEvidenceRepository: EvidenceRepository = {
  async getForScenario(scenario, options) {
    options?.signal?.throwIfAborted();
    return createDemoEvidenceBundle(scenario);
  },
};
