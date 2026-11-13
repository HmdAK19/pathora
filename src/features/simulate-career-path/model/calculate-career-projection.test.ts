import { describe, expect, it } from "vitest";

import type { ScenarioAssumptions } from "@/entities/scenario";

import { calculateCareerProjection } from "./calculate-career-projection";

const baseline: ScenarioAssumptions = {
  currentReadiness: 62,
  weeklyHours: 12,
  marketDemand: 78,
  monthlyLearningBudget: 180,
};

describe("calculateCareerProjection", () => {
  it("returns a transparent range around the baseline projection", () => {
    expect(calculateCareerProjection(baseline)).toEqual({
      readinessMonths: 7,
      readinessWindow: { min: 5, max: 9 },
      confidence: "high",
      evidenceScore: 74,
      estimatedInvestment: 1260,
    });
  });

  it("rewards more focused learning with a shorter path", () => {
    const slower = calculateCareerProjection({ ...baseline, weeklyHours: 6 });
    const faster = calculateCareerProjection({ ...baseline, weeklyHours: 18 });

    expect(faster.readinessMonths).toBeLessThan(slower.readinessMonths);
  });

  it("clamps unsafe boundary values", () => {
    const projection = calculateCareerProjection({
      currentReadiness: 140,
      weeklyHours: 0,
      marketDemand: -20,
      monthlyLearningBudget: -100,
    });

    expect(projection.readinessMonths).toBeGreaterThanOrEqual(1);
    expect(projection.evidenceScore).toBeLessThanOrEqual(100);
    expect(projection.estimatedInvestment).toBe(0);
  });
});
