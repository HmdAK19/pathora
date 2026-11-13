import type { ScenarioDraft } from "@/entities/scenario";

export type ScenarioDraftField =
  | "title"
  | "role"
  | "destination"
  | "currentReadiness"
  | "weeklyHours"
  | "marketDemand"
  | "monthlyLearningBudget";

export type ScenarioDraftErrors = Partial<Record<ScenarioDraftField, string>>;

const textRules: Record<"title" | "role" | "destination", [number, number]> = {
  title: [3, 70],
  role: [3, 80],
  destination: [2, 80],
};

function validateText(
  label: string,
  value: string,
  [min, max]: [number, number],
) {
  const trimmedValue = value.trim();

  if (trimmedValue.length < min) {
    return `${label} must have at least ${min} characters.`;
  }

  if (trimmedValue.length > max) {
    return `${label} must have at most ${max} characters.`;
  }

  return undefined;
}

function validateNumber(
  label: string,
  value: number,
  min: number,
  max: number,
) {
  if (!Number.isFinite(value) || value < min || value > max) {
    return `${label} must be between ${min} and ${max}.`;
  }

  return undefined;
}

export function validateScenarioDraft(
  draft: ScenarioDraft,
  fields: ScenarioDraftField[] = [
    "title",
    "role",
    "destination",
    "currentReadiness",
    "weeklyHours",
    "marketDemand",
    "monthlyLearningBudget",
  ],
): ScenarioDraftErrors {
  const errors: ScenarioDraftErrors = {};

  for (const field of fields) {
    switch (field) {
      case "title":
      case "role":
      case "destination": {
        const error = validateText(
          field === "title"
            ? "Scenario name"
            : field === "role"
              ? "Target role"
              : "Destination",
          draft[field],
          textRules[field],
        );

        if (error) {
          errors[field] = error;
        }
        break;
      }
      case "currentReadiness": {
        const error = validateNumber(
          "Current readiness",
          draft.assumptions.currentReadiness,
          0,
          100,
        );
        if (error) {
          errors[field] = error;
        }
        break;
      }
      case "weeklyHours": {
        const error = validateNumber(
          "Focused learning",
          draft.assumptions.weeklyHours,
          1,
          40,
        );
        if (error) {
          errors[field] = error;
        }
        break;
      }
      case "marketDemand": {
        const error = validateNumber(
          "Market demand signal",
          draft.assumptions.marketDemand,
          0,
          100,
        );
        if (error) {
          errors[field] = error;
        }
        break;
      }
      case "monthlyLearningBudget": {
        const error = validateNumber(
          "Monthly learning budget",
          draft.assumptions.monthlyLearningBudget,
          0,
          10_000,
        );
        if (error) {
          errors[field] = error;
        }
        break;
      }
    }
  }

  return errors;
}
