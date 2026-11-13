import { beforeEach, describe, expect, it } from "vitest";

import type { CareerScenario } from "./scenario";
import {
  browserScenarioStore,
  emptyScenarioCollection,
  parseScenarioCollection,
} from "./scenario-store";

const firstScenario: CareerScenario = {
  id: "scenario-1",
  title: "First path",
  role: "Frontend Engineer",
  destination: "Berlin",
  assumptions: {
    currentReadiness: 50,
    weeklyHours: 8,
    marketDemand: 60,
    monthlyLearningBudget: 150,
  },
  createdAt: "2026-11-13T00:00:00.000Z",
  updatedAt: "2026-11-13T00:00:00.000Z",
};

const secondScenario: CareerScenario = {
  ...firstScenario,
  id: "scenario-2",
  title: "Second path",
};

describe("browserScenarioStore", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves newest scenarios first and activates the latest", () => {
    expect(browserScenarioStore.save(firstScenario)).toBe(true);
    expect(browserScenarioStore.save(secondScenario)).toBe(true);

    expect(parseScenarioCollection(browserScenarioStore.getSnapshot())).toEqual(
      {
        activeScenarioId: "scenario-2",
        scenarios: [secondScenario, firstScenario],
      },
    );
  });

  it("selects only scenarios that exist", () => {
    browserScenarioStore.save(firstScenario);

    expect(browserScenarioStore.setActive("missing")).toBe(false);
    expect(browserScenarioStore.setActive(firstScenario.id)).toBe(true);
  });

  it("falls back to the next scenario after removing the active one", () => {
    browserScenarioStore.save(firstScenario);
    browserScenarioStore.save(secondScenario);
    browserScenarioStore.remove(secondScenario.id);

    expect(parseScenarioCollection(browserScenarioStore.getSnapshot())).toEqual(
      {
        activeScenarioId: firstScenario.id,
        scenarios: [firstScenario],
      },
    );
  });

  it("does not report success when removing a missing scenario", () => {
    expect(browserScenarioStore.remove("missing")).toBe(false);
  });
});

describe("parseScenarioCollection", () => {
  it("treats malformed persisted data as an empty collection", () => {
    expect(parseScenarioCollection("{invalid-json")).toEqual(
      emptyScenarioCollection,
    );
  });

  it("filters scenarios with assumptions outside accepted boundaries", () => {
    const invalidScenario = {
      ...firstScenario,
      assumptions: { ...firstScenario.assumptions, weeklyHours: 200 },
    };

    expect(
      parseScenarioCollection(
        JSON.stringify({
          activeScenarioId: invalidScenario.id,
          scenarios: [invalidScenario],
        }),
      ),
    ).toEqual(emptyScenarioCollection);
  });
});
