import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { EvidenceRepository } from "@/entities/evidence";
import { demoCareerScenario } from "@/entities/scenario";

import { EvidencePanel } from "./evidence-panel";

describe("EvidencePanel", () => {
  it("renders traceable modeled evidence", async () => {
    render(<EvidencePanel scenario={demoCareerScenario} />);

    expect(await screen.findByText("Learning capacity")).toBeVisible();
    expect(screen.getByText("52h / month")).toBeVisible();
    expect(screen.getByText("Modeled prototype · not live data")).toBeVisible();
  });

  it("lets the user retry a failed adapter", async () => {
    const getForScenario = vi
      .fn<EvidenceRepository["getForScenario"]>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({
        generatedAt: "2026-01-01T00:00:00.000Z",
        scenarioId: demoCareerScenario.id,
        signals: [],
        status: "modeled",
      });

    render(
      <EvidencePanel
        scenario={demoCareerScenario}
        repository={{ getForScenario }}
      />,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Retry" }));

    await waitFor(() => expect(getForScenario).toHaveBeenCalledTimes(2));
    expect(
      await screen.findByText(
        "No evidence is available for this scenario yet.",
      ),
    ).toBeVisible();
  });
});
