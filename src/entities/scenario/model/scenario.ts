export interface ScenarioAssumptions {
  currentReadiness: number;
  weeklyHours: number;
  marketDemand: number;
  monthlyLearningBudget: number;
}

export interface CareerScenario {
  createdAt: string;
  id: string;
  title: string;
  destination: string;
  role: string;
  assumptions: ScenarioAssumptions;
  updatedAt: string;
}

export type ProjectionConfidence = "low" | "medium" | "high";

export interface ScenarioProjection {
  readinessMonths: number;
  readinessWindow: {
    min: number;
    max: number;
  };
  confidence: ProjectionConfidence;
  evidenceScore: number;
  estimatedInvestment: number;
}
