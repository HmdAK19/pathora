"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  browserScenarioStore,
  createCareerScenario,
  initialScenarioDraft,
  type CareerScenario,
  type ScenarioAssumptions,
  type ScenarioDraft,
  type ScenarioStore,
} from "@/entities/scenario";
import { calculateCareerProjection } from "@/features/simulate-career-path";
import { formatEuro } from "@/shared/lib/formatters";
import { BrandMark } from "@/shared/ui/brand-mark";
import { Button } from "@/shared/ui/button";

import {
  browserScenarioDraftStore,
  parseScenarioDraft,
  type ScenarioDraftStore,
} from "../model/scenario-draft-store";
import {
  validateScenarioDraft,
  type ScenarioDraftErrors,
  type ScenarioDraftField,
} from "../model/scenario-draft-validation";

const steps = [
  { id: "intent", label: "Intent", description: "Define the direction" },
  { id: "assumptions", label: "Assumptions", description: "Set the variables" },
  { id: "review", label: "Review", description: "Check the path" },
] as const;

const stepDescriptions: Record<ScenarioStep, string> = {
  intent: "Define the direction",
  assumptions: "Set the variables",
  review: "Check the path",
};

type ScenarioStep = (typeof steps)[number]["id"];

const fieldsByStep: Record<ScenarioStep, ScenarioDraftField[]> = {
  intent: ["title", "role", "destination"],
  assumptions: [
    "currentReadiness",
    "weeklyHours",
    "marketDemand",
    "monthlyLearningBudget",
  ],
  review: [
    "title",
    "role",
    "destination",
    "currentReadiness",
    "weeklyHours",
    "marketDemand",
    "monthlyLearningBudget",
  ],
};

const stepOrder: ScenarioStep[] = ["intent", "assumptions", "review"];

function getScenarioStep(step: string | null): ScenarioStep {
  return stepOrder.includes(step as ScenarioStep)
    ? (step as ScenarioStep)
    : "intent";
}

function firstErrorField(errors: ScenarioDraftErrors) {
  return Object.keys(errors)[0] as ScenarioDraftField | undefined;
}

function removeFieldError(
  errors: ScenarioDraftErrors,
  field: ScenarioDraftField,
): ScenarioDraftErrors {
  const nextErrors = { ...errors };
  delete nextErrors[field];
  return nextErrors;
}

interface FieldErrorProps {
  message?: string | undefined;
  name: string;
}

function FieldError({ message, name }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p id={`${name}-error`} role="alert" className="mt-2 text-xs text-rose-300">
      {message}
    </p>
  );
}

interface TextFieldProps {
  error?: string | undefined;
  helpText: string;
  label: string;
  name: "title" | "role" | "destination";
  onChange: (name: "title" | "role" | "destination", value: string) => void;
  placeholder: string;
  value: string;
}

function TextField({
  error,
  helpText,
  label,
  name,
  onChange,
  placeholder,
  value,
}: TextFieldProps) {
  const descriptionId = error ? `${name}-error` : `${name}-help`;

  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-slate-200">
        {label}
      </label>
      <p id={`${name}-help`} className="mt-1 text-xs leading-5 text-muted">
        {helpText}
      </p>
      <input
        id={name}
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.currentTarget.value)}
        aria-describedby={descriptionId}
        aria-invalid={Boolean(error)}
        placeholder={placeholder}
        className="mt-3 min-h-11 w-full rounded-xl border border-white/10 bg-black/15 px-3.5 text-sm text-white transition-colors outline-none placeholder:text-slate-600 focus:border-brand focus:ring-2 focus:ring-brand/20 aria-[invalid=true]:border-rose-400"
      />
      <FieldError name={name} message={error} />
    </div>
  );
}

interface RangeFieldProps {
  error?: string | undefined;
  helpText: string;
  label: string;
  max: number;
  min: number;
  name: Exclude<
    ScenarioDraftField,
    "title" | "role" | "destination" | "monthlyLearningBudget"
  >;
  suffix: string;
  value: number;
  onChange: (
    name: Exclude<
      ScenarioDraftField,
      "title" | "role" | "destination" | "monthlyLearningBudget"
    >,
    value: number,
  ) => void;
}

function RangeField({
  error,
  helpText,
  label,
  max,
  min,
  name,
  onChange,
  suffix,
  value,
}: RangeFieldProps) {
  const descriptionId = error ? `${name}-error` : `${name}-help`;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={name} className="text-sm font-medium text-slate-200">
          {label}
        </label>
        <output
          htmlFor={name}
          className="rounded-lg border border-white/10 bg-white/[0.035] px-2.5 py-1 font-mono text-xs text-slate-100"
        >
          {value}
          {suffix}
        </output>
      </div>
      <p id={`${name}-help`} className="mt-1 text-xs leading-5 text-muted">
        {helpText}
      </p>
      <input
        id={name}
        name={name}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(name, event.currentTarget.valueAsNumber)}
        aria-describedby={descriptionId}
        aria-invalid={Boolean(error)}
        className="mt-3 w-full"
      />
      <FieldError name={name} message={error} />
    </div>
  );
}

interface BudgetFieldProps {
  error?: string | undefined;
  value: number;
  onChange: (value: number) => void;
}

function BudgetField({ error, onChange, value }: BudgetFieldProps) {
  const descriptionId = error
    ? "monthlyLearningBudget-error"
    : "monthlyLearningBudget-help";

  return (
    <div>
      <label
        htmlFor="monthlyLearningBudget"
        className="text-sm font-medium text-slate-200"
      >
        Monthly learning budget
      </label>
      <p
        id="monthlyLearningBudget-help"
        className="mt-1 text-xs leading-5 text-muted"
      >
        Courses, events, coaching, or other deliberate investment.
      </p>
      <div className="relative mt-3">
        <span
          className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-muted"
          aria-hidden="true"
        >
          €
        </span>
        <input
          id="monthlyLearningBudget"
          name="monthlyLearningBudget"
          type="number"
          min="0"
          max="10000"
          value={value}
          onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
          aria-describedby={descriptionId}
          aria-invalid={Boolean(error)}
          className="min-h-11 w-full rounded-xl border border-white/10 bg-black/15 py-2 pr-3 pl-8 text-sm text-white transition-colors outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 aria-[invalid=true]:border-rose-400"
        />
      </div>
      <FieldError name="monthlyLearningBudget" message={error} />
    </div>
  );
}

interface ScenarioComposerProps {
  draftStore?: ScenarioDraftStore;
  scenarioStore?: ScenarioStore;
}

export function ScenarioComposer({
  draftStore = browserScenarioDraftStore,
  scenarioStore = browserScenarioStore,
}: ScenarioComposerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = getScenarioStep(searchParams.get("step"));
  const draftSnapshot = useSyncExternalStore(
    (listener) => draftStore.subscribe(listener),
    () => draftStore.getSnapshot(),
    () => null,
  );
  const persistedDraft = parseScenarioDraft(draftSnapshot);
  const [draftOverride, setDraftOverride] = useState<ScenarioDraft | null>(
    null,
  );
  const draft = draftOverride ?? persistedDraft ?? initialScenarioDraft;
  const [errors, setErrors] = useState<ScenarioDraftErrors>({});
  const [statusMessage, setStatusMessage] = useState("");
  const [createdScenario, setCreatedScenario] = useState<CareerScenario | null>(
    null,
  );
  const pendingFocusField = useRef<ScenarioDraftField | null>(null);
  const hasRestoredDraft = persistedDraft !== null && draftOverride === null;
  const visibleStatusMessage = hasRestoredDraft
    ? "Your saved draft was restored."
    : statusMessage;

  useEffect(() => {
    const field = pendingFocusField.current;

    if (!field) {
      return;
    }

    const animationFrame = requestAnimationFrame(() => {
      document.getElementById(field)?.focus();
      pendingFocusField.current = null;
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [errors, step]);

  const changeStep = (nextStep: ScenarioStep) => {
    router.replace(`/scenarios/new?step=${nextStep}`, { scroll: false });
  };

  const focusError = (nextErrors: ScenarioDraftErrors) => {
    const field = firstErrorField(nextErrors);

    if (!field) {
      return;
    }

    pendingFocusField.current = field;
  };

  const updateTextField = (
    field: "title" | "role" | "destination",
    value: string,
  ) => {
    setDraftOverride((current) => ({
      ...(current ?? draft),
      [field]: value,
    }));
    setErrors((current) => removeFieldError(current, field));
  };

  const updateAssumption = (
    field: keyof ScenarioAssumptions,
    value: number,
  ) => {
    setDraftOverride((current) => {
      const currentDraft = current ?? draft;

      return {
        ...currentDraft,
        assumptions: { ...currentDraft.assumptions, [field]: value },
      };
    });
    setErrors((current) => removeFieldError(current, field));
  };

  const saveDraft = () => {
    if (draftStore.save(draft)) {
      setDraftOverride(draft);
      setStatusMessage("Draft saved on this device.");
      return;
    }

    setStatusMessage("Your browser did not allow local draft storage.");
  };

  const moveForward = () => {
    const nextErrors = validateScenarioDraft(draft, fieldsByStep[step]);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      focusError(nextErrors);
      return;
    }

    setErrors({});
    const currentStepIndex = stepOrder.indexOf(step);
    const nextStep = stepOrder[currentStepIndex + 1];

    if (nextStep) {
      changeStep(nextStep);
    }
  };

  const createScenario = () => {
    const nextErrors = validateScenarioDraft(draft);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      changeStep(
        nextErrors.title || nextErrors.role || nextErrors.destination
          ? "intent"
          : "assumptions",
      );
      focusError(nextErrors);
      return;
    }

    const scenario = createCareerScenario(draft, {
      id: window.crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    });

    if (!scenarioStore.save(scenario)) {
      setStatusMessage(
        "Scenario is ready, but this browser did not allow local storage.",
      );
      return;
    }

    draftStore.clear();
    setErrors({});
    setCreatedScenario(scenario);
  };

  const resetComposer = () => {
    draftStore.clear();
    setDraftOverride(initialScenarioDraft);
    setErrors({});
    setCreatedScenario(null);
    setStatusMessage("Draft cleared. Start with a new path.");
    changeStep("intent");
  };

  const projection = calculateCareerProjection(draft.assumptions);
  const currentStepIndex = stepOrder.indexOf(step);
  const activeStepDescription = stepDescriptions[step];
  const previousStep =
    currentStepIndex > 0 ? stepOrder[currentStepIndex - 1] : undefined;

  if (createdScenario) {
    return (
      <main
        id="main-content"
        className="grid min-h-dvh place-items-center px-4 py-8 sm:px-6"
      >
        <section className="w-full max-w-xl rounded-3xl border border-brand/20 bg-surface p-6 text-center shadow-[0_24px_80px_rgba(0,0,0,0.3)] sm:p-9">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand text-xl font-bold text-slate-950">
            ✓
          </div>
          <p className="mt-6 font-mono text-xs tracking-[0.2em] text-brand uppercase">
            Scenario created
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {createdScenario.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Your path is saved locally on this device. As evidence changes, you
            can return and recalibrate its assumptions.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" onClick={resetComposer}>
              Create another
            </Button>
            <Link
              href="/"
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Back to workspace
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main id="main-content" className="min-h-dvh px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#090d16]/92 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
        <header className="flex min-h-16 items-center justify-between border-b border-white/8 px-5 sm:px-7">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            <BrandMark />
            <span className="font-semibold tracking-tight text-white">
              Pathora
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-muted transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            Exit composer
          </Link>
        </header>

        <div className="grid lg:grid-cols-[15.5rem_1fr]">
          <aside className="border-b border-white/8 bg-black/10 p-5 lg:border-r lg:border-b-0 lg:p-7">
            <p className="font-mono text-[0.65rem] tracking-[0.2em] text-brand uppercase">
              New scenario
            </p>
            <h1 className="mt-3 text-xl font-semibold tracking-tight text-white">
              Make the path explicit.
            </h1>
            <ol className="mt-7 grid grid-cols-3 gap-2 lg:block lg:space-y-2">
              {steps.map((item, index) => {
                const isActive = item.id === step;
                const isComplete = index < currentStepIndex;

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => changeStep(item.id)}
                      aria-current={isActive ? "step" : undefined}
                      className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:p-3 ${
                        isActive
                          ? "bg-white/[0.07] text-white"
                          : "text-muted hover:bg-white/[0.04] hover:text-slate-200"
                      }`}
                    >
                      <span
                        className={`grid size-6 shrink-0 place-items-center rounded-full border text-xs font-semibold ${
                          isComplete
                            ? "border-brand bg-brand text-slate-950"
                            : isActive
                              ? "border-brand text-brand"
                              : "border-white/15 text-muted"
                        }`}
                        aria-hidden="true"
                      >
                        {isComplete ? "✓" : index + 1}
                      </span>
                      <span className="sr-only min-w-0 lg:not-sr-only">
                        <span className="block text-sm font-medium">
                          {item.label}
                        </span>
                        <span className="hidden text-xs text-muted lg:block">
                          {item.description}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="mt-7 border-t border-white/8 pt-5 lg:mt-12">
              <p className="text-xs leading-5 text-muted">
                Your draft stays on this device until a connected account and
                data store are introduced.
              </p>
              <Button
                variant="secondary"
                className="mt-4 w-full text-xs"
                onClick={saveDraft}
              >
                Save draft
              </Button>
              {hasRestoredDraft ? (
                <Button
                  variant="secondary"
                  className="mt-2 w-full text-xs"
                  onClick={resetComposer}
                >
                  Clear saved draft
                </Button>
              ) : null}
            </div>
          </aside>

          <section className="min-w-0 p-5 sm:p-7 lg:p-9">
            <div className="flex flex-col gap-4 border-b border-white/8 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-muted">
                  Step {currentStepIndex + 1} of {steps.length}
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">
                  {activeStepDescription}
                </h2>
              </div>
              <p
                aria-live="polite"
                className="min-h-5 text-xs text-brand sm:text-right"
              >
                {visibleStatusMessage}
              </p>
            </div>

            <form
              className="mt-7"
              onSubmit={(event) => {
                event.preventDefault();
                if (step === "review") {
                  createScenario();
                  return;
                }
                moveForward();
              }}
            >
              {step === "intent" ? (
                <div className="grid gap-6">
                  <TextField
                    label="Scenario name"
                    name="title"
                    value={draft.title}
                    placeholder="e.g. Frontend career transition"
                    helpText="Give this path a name you will recognize later."
                    error={errors.title}
                    onChange={updateTextField}
                  />
                  <TextField
                    label="Target role"
                    name="role"
                    value={draft.role}
                    placeholder="e.g. Product-focused Frontend Engineer"
                    helpText="Focus on the role you want to become ready for."
                    error={errors.role}
                    onChange={updateTextField}
                  />
                  <TextField
                    label="Destination"
                    name="destination"
                    value={draft.destination}
                    placeholder="e.g. Berlin, Germany"
                    helpText="A market, company type, city, or another meaningful context."
                    error={errors.destination}
                    onChange={updateTextField}
                  />
                </div>
              ) : null}

              {step === "assumptions" ? (
                <div className="grid gap-7">
                  <RangeField
                    label="Current readiness"
                    name="currentReadiness"
                    min={0}
                    max={100}
                    suffix="%"
                    value={draft.assumptions.currentReadiness}
                    helpText="Your evidence-backed estimate of current role readiness."
                    error={errors.currentReadiness}
                    onChange={updateAssumption}
                  />
                  <RangeField
                    label="Focused learning"
                    name="weeklyHours"
                    min={1}
                    max={40}
                    suffix="h"
                    value={draft.assumptions.weeklyHours}
                    helpText="Time you can protect every week for deliberate practice."
                    error={errors.weeklyHours}
                    onChange={updateAssumption}
                  />
                  <RangeField
                    label="Market demand signal"
                    name="marketDemand"
                    min={0}
                    max={100}
                    suffix="%"
                    value={draft.assumptions.marketDemand}
                    helpText="A transparent proxy until verified market sources are connected."
                    error={errors.marketDemand}
                    onChange={updateAssumption}
                  />
                  <BudgetField
                    value={draft.assumptions.monthlyLearningBudget}
                    error={errors.monthlyLearningBudget}
                    onChange={(value) =>
                      updateAssumption("monthlyLearningBudget", value)
                    }
                  />
                </div>
              ) : null}

              {step === "review" ? (
                <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
                  <section className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
                    <p className="font-mono text-[0.65rem] tracking-[0.2em] text-accent uppercase">
                      Your direction
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-white">
                      {draft.title || "Untitled scenario"}
                    </h3>
                    <dl className="mt-6 space-y-4 text-sm">
                      <div>
                        <dt className="text-muted">Target role</dt>
                        <dd className="mt-1 text-slate-200">
                          {draft.role || "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted">Destination</dt>
                        <dd className="mt-1 text-slate-200">
                          {draft.destination || "—"}
                        </dd>
                      </div>
                    </dl>
                  </section>

                  <section className="rounded-2xl border border-brand/15 bg-[linear-gradient(145deg,rgba(139,123,255,0.13),transparent_60%)] p-5">
                    <p className="text-sm text-muted">Estimated readiness</p>
                    <p className="mt-2 text-5xl font-medium tracking-[-0.06em] text-white">
                      {projection.readinessMonths}
                      <span className="ml-2 text-lg tracking-normal text-slate-400">
                        months
                      </span>
                    </p>
                    <p className="mt-3 text-sm text-slate-400">
                      Likely range: {projection.readinessWindow.min}–
                      {projection.readinessWindow.max} months
                    </p>
                    <dl className="mt-7 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-white/8 bg-black/10 p-3">
                        <dt className="text-xs text-muted">Confidence</dt>
                        <dd className="mt-1 text-sm font-semibold text-white capitalize">
                          {projection.confidence}
                        </dd>
                      </div>
                      <div className="rounded-xl border border-white/8 bg-black/10 p-3">
                        <dt className="text-xs text-muted">Investment</dt>
                        <dd className="mt-1 text-sm font-semibold text-white">
                          {formatEuro(projection.estimatedInvestment)}
                        </dd>
                      </div>
                    </dl>
                  </section>
                </div>
              ) : null}

              <div className="mt-9 flex flex-col-reverse gap-3 border-t border-white/8 pt-5 sm:flex-row sm:justify-between">
                <Button
                  variant="secondary"
                  disabled={currentStepIndex === 0}
                  onClick={() => {
                    if (previousStep) {
                      changeStep(previousStep);
                    }
                  }}
                >
                  Back
                </Button>
                <Button type="submit">
                  {step === "review" ? "Create scenario" : "Continue"}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
