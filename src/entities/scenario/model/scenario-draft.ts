import type { ScenarioAssumptions } from "./scenario";

export interface ScenarioDraft {
  title: string;
  role: string;
  destination: string;
  assumptions: ScenarioAssumptions;
}

export const initialScenarioDraft: ScenarioDraft = {
  title: "",
  role: "",
  destination: "",
  assumptions: {
    currentReadiness: 50,
    weeklyHours: 8,
    marketDemand: 60,
    monthlyLearningBudget: 150,
  },
};
