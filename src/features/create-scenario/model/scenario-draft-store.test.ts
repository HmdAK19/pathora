import { beforeEach, describe, expect, it } from "vitest";

import type { ScenarioDraft } from "@/entities/scenario";

import { browserScenarioDraftStore } from "./scenario-draft-store";

const draft: ScenarioDraft = {
  title: "Career shift",
  role: "Frontend Engineer",
  destination: "Berlin",
  assumptions: {
    currentReadiness: 50,
    weeklyHours: 8,
    marketDemand: 60,
    monthlyLearningBudget: 150,
  },
};

describe("browserScenarioDraftStore", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores and restores a valid draft", () => {
    expect(browserScenarioDraftStore.save(draft)).toBe(true);
    expect(browserScenarioDraftStore.load()).toEqual(draft);
  });

  it("ignores malformed stored values", () => {
    window.localStorage.setItem("pathora:scenario-draft:v1", "{not-json");

    expect(browserScenarioDraftStore.load()).toBeNull();
  });

  it("clears a saved draft", () => {
    browserScenarioDraftStore.save(draft);
    browserScenarioDraftStore.clear();

    expect(browserScenarioDraftStore.load()).toBeNull();
  });
});
