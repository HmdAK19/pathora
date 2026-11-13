import type {
  ProjectionConfidence,
  ScenarioAssumptions,
  ScenarioProjection,
} from "@/entities/scenario";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function getConfidence(
  weeklyHours: number,
  marketDemand: number,
): ProjectionConfidence {
  if (weeklyHours >= 10 && marketDemand >= 65) {
    return "high";
  }

  if (weeklyHours >= 6 && marketDemand >= 40) {
    return "medium";
  }

  return "low";
}

export function calculateCareerProjection(
  assumptions: ScenarioAssumptions,
): ScenarioProjection {
  const currentReadiness = clamp(assumptions.currentReadiness, 0, 99);
  const weeklyHours = clamp(assumptions.weeklyHours, 1, 40);
  const marketDemand = clamp(assumptions.marketDemand, 0, 100);
  const monthlyBudget = Math.max(0, assumptions.monthlyLearningBudget);

  const remainingSkillGap = 100 - currentReadiness;
  const monthlyLearningGain = weeklyHours * 0.55;
  const marketFriction = 1 + (100 - marketDemand) / 200;
  const readinessMonths = clamp(
    Math.ceil((remainingSkillGap / monthlyLearningGain) * marketFriction),
    1,
    36,
  );

  const confidence = getConfidence(weeklyHours, marketDemand);
  const uncertainty =
    confidence === "high" ? 0.18 : confidence === "medium" ? 0.28 : 0.4;
  const evidenceScore = clamp(
    Math.round(
      currentReadiness * 0.45 +
        marketDemand * 0.4 +
        Math.min(weeklyHours * 1.25, 20),
    ),
    0,
    100,
  );

  return {
    readinessMonths,
    readinessWindow: {
      min: Math.max(1, Math.floor(readinessMonths * (1 - uncertainty))),
      max: Math.ceil(readinessMonths * (1 + uncertainty)),
    },
    confidence,
    evidenceScore,
    estimatedInvestment: readinessMonths * monthlyBudget,
  };
}
