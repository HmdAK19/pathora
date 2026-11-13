import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScenarioSimulator } from "./scenario-simulator";

describe("ScenarioSimulator", () => {
  it("recalculates and resets an assumption", () => {
    render(<ScenarioSimulator />);

    const readiness = screen.getByRole("slider", {
      name: "Current readiness",
    });

    fireEvent.change(readiness, { target: { value: "80" } });
    expect(screen.getByText("80%", { selector: "output" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByText("62%", { selector: "output" })).toBeInTheDocument();
  });
});
