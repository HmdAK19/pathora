import { describe, expect, it } from "vitest";

import { demoCareerScenario, type CareerScenario } from "@/entities/scenario";

import { compareCareerScenarios } from "./compare-career-scenarios";

const slowerScenario: CareerScenario = {
  ...demoCareerScenario,
  id: "slower",
  title: "Slower path",
  assumptions: {
    ...demoCareerScenario.assumptions,
    weeklyHours: 4,
    marketDemand: 35,
  },
};

describe("compareCareerScenarios", () => {
  it("ranks stronger evidence and shorter readiness higher", () => {
    const comparison = compareCareerScenarios([
      slowerScenario,
      demoCareerScenario,
    ]);

    expect(comparison[0]?.scenario.id).toBe(demoCareerScenario.id);
    expect(comparison[0]?.overallScore).toBeGreaterThan(
      comparison[1]?.overallScore ?? 0,
    );
  });

  it("does not mutate the input order", () => {
    const scenarios = [slowerScenario, demoCareerScenario];

    compareCareerScenarios(scenarios);

    expect(scenarios[0]?.id).toBe("slower");
  });
});
