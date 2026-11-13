import { describe, expect, it } from "vitest";

import type { ScenarioDraft } from "@/entities/scenario";

import { validateScenarioDraft } from "./scenario-draft-validation";

const validDraft: ScenarioDraft = {
  title: "Berlin frontend transition",
  role: "Product-focused Frontend Engineer",
  destination: "Berlin, Germany",
  assumptions: {
    currentReadiness: 62,
    weeklyHours: 12,
    marketDemand: 78,
    monthlyLearningBudget: 180,
  },
};

describe("validateScenarioDraft", () => {
  it("accepts a complete valid draft", () => {
    expect(validateScenarioDraft(validDraft)).toEqual({});
  });

  it("validates only the fields requested by the active step", () => {
    const errors = validateScenarioDraft(
      { ...validDraft, title: " ", role: "", destination: "" },
      ["title"],
    );

    expect(errors).toEqual({
      title: "Scenario name must have at least 3 characters.",
    });
  });

  it("rejects unsafe numeric assumptions", () => {
    const errors = validateScenarioDraft({
      ...validDraft,
      assumptions: {
        ...validDraft.assumptions,
        weeklyHours: 0,
        monthlyLearningBudget: Number.NaN,
      },
    });

    expect(errors.weeklyHours).toBe(
      "Focused learning must be between 1 and 40.",
    );
    expect(errors.monthlyLearningBudget).toBe(
      "Monthly learning budget must be between 0 and 10000.",
    );
  });
});
