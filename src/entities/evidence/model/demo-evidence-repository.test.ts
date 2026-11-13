import { describe, expect, it } from "vitest";

import { demoCareerScenario } from "@/entities/scenario";

import { createDemoEvidenceBundle } from "./demo-evidence-repository";

describe("createDemoEvidenceBundle", () => {
  it("keeps every modeled signal traceable", () => {
    const bundle = createDemoEvidenceBundle(
      demoCareerScenario,
      "2026-01-01T00:00:00.000Z",
    );

    expect(bundle.status).toBe("modeled");
    expect(bundle.signals).toHaveLength(4);
    expect(bundle.signals.every((signal) => signal.source.length > 0)).toBe(
      true,
    );
    expect(
      bundle.signals.every((signal) => signal.methodology.length > 0),
    ).toBe(true);
  });

  it("derives learning capacity from the scenario commitment", () => {
    const bundle = createDemoEvidenceBundle(demoCareerScenario);

    expect(
      bundle.signals.find((signal) => signal.id === "learning-capacity")?.value,
    ).toBe("52h / month");
  });
});
