import { describe, expect, it } from "vitest";

import type { ScenarioDraft } from "./scenario-draft";
import { createCareerScenario } from "./create-scenario";

const draft: ScenarioDraft = {
  title: "  Career shift  ",
  role: " Frontend Engineer ",
  destination: " Berlin ",
  assumptions: {
    currentReadiness: 50,
    weeklyHours: 8,
    marketDemand: 60,
    monthlyLearningBudget: 150,
  },
};

describe("createCareerScenario", () => {
  it("creates a normalized scenario with stable identity metadata", () => {
    expect(
      createCareerScenario(draft, {
        id: "scenario-1",
        timestamp: "2026-11-13T00:00:00.000Z",
      }),
    ).toEqual({
      id: "scenario-1",
      title: "Career shift",
      role: "Frontend Engineer",
      destination: "Berlin",
      assumptions: draft.assumptions,
      createdAt: "2026-11-13T00:00:00.000Z",
      updatedAt: "2026-11-13T00:00:00.000Z",
    });
  });
});
