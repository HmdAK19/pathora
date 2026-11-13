import type { CareerScenario, ScenarioProjection } from "@/entities/scenario";
import { calculateCareerProjection } from "@/features/simulate-career-path";

export interface ScenarioComparison {
  overallScore: number;
  projection: ScenarioProjection;
  scenario: CareerScenario;
}

const calculateOverallScore = (
  scenario: CareerScenario,
  projection: ScenarioProjection,
) =>
  Math.round(
    projection.evidenceScore +
      scenario.assumptions.marketDemand * 0.3 -
      projection.readinessMonths * 2 -
      projection.estimatedInvestment / 500,
  );

export function compareCareerScenarios(
  scenarios: CareerScenario[],
): ScenarioComparison[] {
  return scenarios
    .map((scenario) => {
      const projection = calculateCareerProjection(scenario.assumptions);

      return {
        scenario,
        projection,
        overallScore: calculateOverallScore(scenario, projection),
      };
    })
    .sort(
      (left, right) =>
        right.overallScore - left.overallScore ||
        left.scenario.title.localeCompare(right.scenario.title),
    );
}
