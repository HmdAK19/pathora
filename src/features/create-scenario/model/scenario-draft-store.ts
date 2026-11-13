import type { ScenarioDraft } from "@/entities/scenario";

const storageKey = "pathora:scenario-draft:v1";
const storageChangeEvent = "pathora:scenario-draft-change";

export interface ScenarioDraftStore {
  clear(): void;
  getSnapshot(): string | null;
  load(): ScenarioDraft | null;
  save(draft: ScenarioDraft): boolean;
  subscribe(listener: () => void): () => void;
}

function isScenarioDraft(value: unknown): value is ScenarioDraft {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const assumptions = candidate.assumptions as
    Record<string, unknown> | undefined;

  if (!assumptions) {
    return false;
  }

  return (
    typeof candidate.title === "string" &&
    typeof candidate.role === "string" &&
    typeof candidate.destination === "string" &&
    typeof assumptions.currentReadiness === "number" &&
    typeof assumptions.weeklyHours === "number" &&
    typeof assumptions.marketDemand === "number" &&
    typeof assumptions.monthlyLearningBudget === "number"
  );
}

export function parseScenarioDraft(serializedDraft: string | null) {
  if (!serializedDraft) {
    return null;
  }

  try {
    const parsedDraft: unknown = JSON.parse(serializedDraft);
    return isScenarioDraft(parsedDraft) ? parsedDraft : null;
  } catch {
    return null;
  }
}

function getBrowserSnapshot() {
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function notifyDraftChange() {
  window.dispatchEvent(new Event(storageChangeEvent));
}

export const browserScenarioDraftStore: ScenarioDraftStore = {
  clear() {
    try {
      window.localStorage.removeItem(storageKey);
      notifyDraftChange();
    } catch {
      // Storage can be unavailable in restrictive browser contexts.
    }
  },
  getSnapshot() {
    return getBrowserSnapshot();
  },
  load() {
    return parseScenarioDraft(getBrowserSnapshot());
  },
  save(draft) {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(draft));
      notifyDraftChange();
      return true;
    } catch {
      return false;
    }
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
