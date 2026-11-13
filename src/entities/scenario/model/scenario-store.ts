import type { CareerScenario } from "./scenario";

const storageKey = "pathora:scenarios:v1";
const storageChangeEvent = "pathora:scenarios-change";

export interface ScenarioCollection {
  activeScenarioId: string | null;
  scenarios: CareerScenario[];
}

export interface ScenarioStore {
  getSnapshot(): string | null;
  remove(id: string): boolean;
  save(scenario: CareerScenario): boolean;
  setActive(id: string): boolean;
  subscribe(listener: () => void): () => void;
}

export const emptyScenarioCollection: ScenarioCollection = {
  activeScenarioId: null,
  scenarios: [],
};

function isScenarioAssumptions(value: unknown) {
  if (!value || typeof value !== "object") {
    return false;
  }

  const assumptions = value as Record<string, unknown>;
  return (
    typeof assumptions.currentReadiness === "number" &&
    assumptions.currentReadiness >= 0 &&
    assumptions.currentReadiness <= 100 &&
    typeof assumptions.weeklyHours === "number" &&
    assumptions.weeklyHours >= 1 &&
    assumptions.weeklyHours <= 40 &&
    typeof assumptions.marketDemand === "number" &&
    assumptions.marketDemand >= 0 &&
    assumptions.marketDemand <= 100 &&
    typeof assumptions.monthlyLearningBudget === "number" &&
    assumptions.monthlyLearningBudget >= 0 &&
    assumptions.monthlyLearningBudget <= 10_000
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidTimestamp(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(new Date(value).getTime());
}

function isCareerScenario(value: unknown): value is CareerScenario {
  if (!value || typeof value !== "object") {
    return false;
  }

  const scenario = value as Record<string, unknown>;
  return (
    isNonEmptyString(scenario.id) &&
    isNonEmptyString(scenario.title) &&
    isNonEmptyString(scenario.role) &&
    isNonEmptyString(scenario.destination) &&
    isValidTimestamp(scenario.createdAt) &&
    isValidTimestamp(scenario.updatedAt) &&
    isScenarioAssumptions(scenario.assumptions)
  );
}

export function parseScenarioCollection(
  serializedCollection: string | null,
): ScenarioCollection {
  if (!serializedCollection) {
    return emptyScenarioCollection;
  }

  try {
    const parsedCollection: unknown = JSON.parse(serializedCollection);

    if (!parsedCollection || typeof parsedCollection !== "object") {
      return emptyScenarioCollection;
    }

    const candidate = parsedCollection as Record<string, unknown>;
    if (!Array.isArray(candidate.scenarios)) {
      return emptyScenarioCollection;
    }

    const scenarios = candidate.scenarios.filter(isCareerScenario);
    const requestedActiveId =
      typeof candidate.activeScenarioId === "string"
        ? candidate.activeScenarioId
        : null;
    const activeScenarioId = scenarios.some(
      (scenario) => scenario.id === requestedActiveId,
    )
      ? requestedActiveId
      : (scenarios[0]?.id ?? null);

    return { activeScenarioId, scenarios };
  } catch {
    return emptyScenarioCollection;
  }
}

function readSnapshot() {
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function writeCollection(collection: ScenarioCollection) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(collection));
    window.dispatchEvent(new Event(storageChangeEvent));
    return true;
  } catch {
    return false;
  }
}

export const browserScenarioStore: ScenarioStore = {
  getSnapshot() {
    return readSnapshot();
  },
  remove(id) {
    const current = parseScenarioCollection(readSnapshot());

    if (!current.scenarios.some((scenario) => scenario.id === id)) {
      return false;
    }

    const scenarios = current.scenarios.filter(
      (scenario) => scenario.id !== id,
    );
    const activeScenarioId =
      current.activeScenarioId === id
        ? (scenarios[0]?.id ?? null)
        : current.activeScenarioId;

    return writeCollection({ activeScenarioId, scenarios });
  },
  save(scenario) {
    const current = parseScenarioCollection(readSnapshot());
    const scenarios = [
      scenario,
      ...current.scenarios.filter((item) => item.id !== scenario.id),
    ];

    return writeCollection({ activeScenarioId: scenario.id, scenarios });
  },
  setActive(id) {
    const current = parseScenarioCollection(readSnapshot());

    if (!current.scenarios.some((scenario) => scenario.id === id)) {
      return false;
    }

    return writeCollection({ ...current, activeScenarioId: id });
  },
  subscribe(listener) {
    const onStorageChange = (event: StorageEvent) => {
      if (event.key === storageKey) {
        listener();
      }
    };

    window.addEventListener("storage", onStorageChange);
    window.addEventListener(storageChangeEvent, listener);

    return () => {
      window.removeEventListener("storage", onStorageChange);
      window.removeEventListener(storageChangeEvent, listener);
    };
  },
};
