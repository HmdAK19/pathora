import type { CareerScenario } from "@/entities/scenario";

export type EvidenceConfidence = "low" | "medium" | "high";
export type EvidenceFreshness = "prototype" | "stale" | "fresh";

export interface EvidenceSignal {
  confidence: EvidenceConfidence;
  freshness: EvidenceFreshness;
  id: string;
  label: string;
  methodology: string;
  source: string;
  value: string;
}

export interface EvidenceBundle {
  generatedAt: string;
  scenarioId: CareerScenario["id"];
  signals: EvidenceSignal[];
  status: "modeled" | "verified";
}

export interface EvidenceRepository {
  getForScenario(
    scenario: CareerScenario,
    options?: { signal?: AbortSignal },
  ): Promise<EvidenceBundle>;
}
