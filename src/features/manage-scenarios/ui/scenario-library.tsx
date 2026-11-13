"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import {
  browserScenarioStore,
  parseScenarioCollection,
  type ScenarioStore,
} from "@/entities/scenario";
import { calculateCareerProjection } from "@/features/simulate-career-path";
import { formatShortDate } from "@/shared/lib/formatters";
import { BrandMark } from "@/shared/ui/brand-mark";
import { Button } from "@/shared/ui/button";

interface ScenarioLibraryProps {
  scenarioStore?: ScenarioStore;
}

export function ScenarioLibrary({
  scenarioStore = browserScenarioStore,
}: ScenarioLibraryProps) {
  const snapshot = useSyncExternalStore(
    (listener) => scenarioStore.subscribe(listener),
    () => scenarioStore.getSnapshot(),
    () => null,
  );
  const collection = parseScenarioCollection(snapshot);
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const setActiveScenario = (id: string, title: string) => {
    setStatusMessage(
      scenarioStore.setActive(id)
        ? `${title} is now your active scenario.`
        : "The scenario could not be selected.",
    );
  };

  const removeScenario = (id: string, title: string) => {
    if (!scenarioStore.remove(id)) {
      setStatusMessage("The scenario could not be removed.");
      return;
    }

    setPendingRemovalId(null);
    setStatusMessage(`${title} was removed.`);
  };

  return (
    <main id="main-content" className="min-h-dvh px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto min-h-[calc(100dvh-2rem)] max-w-6xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#090d16]/92 shadow-[0_30px_120px_rgba(0,0,0,0.45)] sm:min-h-[calc(100dvh-3rem)]">
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
          <div className="flex items-center gap-2">
            <Link
              href="/scenarios/compare"
              className="inline-flex min-h-9 items-center rounded-xl border border-white/10 px-3.5 text-sm font-medium text-slate-300 transition-colors hover:border-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Compare
            </Link>
            <Link
              href="/scenarios/new?step=intent"
              className="inline-flex min-h-9 items-center rounded-xl bg-brand px-3.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              New scenario
            </Link>
          </div>
        </header>

        <section
          className="p-5 sm:p-7 lg:p-9"
          aria-labelledby="scenario-library-title"
        >
          <div className="flex flex-col gap-4 border-b border-white/8 pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[0.65rem] tracking-[0.2em] text-brand uppercase">
                Scenario library
              </p>
              <h1
                id="scenario-library-title"
                className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white"
              >
                Compare the paths you could take.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                Keep multiple futures explicit, select the one you are actively
                pursuing, and remove paths that no longer matter.
              </p>
            </div>
            <p
              aria-live="polite"
              className="min-h-5 text-xs text-brand sm:text-right"
            >
              {statusMessage}
            </p>
          </div>

          {collection.scenarios.length === 0 ? (
            <div className="grid min-h-80 place-items-center py-10 text-center">
              <div className="max-w-md">
                <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl text-brand">
                  ◇
                </div>
                <h2 className="mt-5 text-xl font-semibold text-white">
                  No saved scenarios yet
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Create your first path and its assumptions will appear here
                  for selection and comparison.
                </p>
                <Link
                  href="/scenarios/new?step=intent"
                  className="mt-6 inline-flex min-h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  Create first scenario
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-7 grid gap-4 lg:grid-cols-2">
              {collection.scenarios.map((scenario) => {
                const projection = calculateCareerProjection(
                  scenario.assumptions,
                );
                const isActive = collection.activeScenarioId === scenario.id;
                const isPendingRemoval = pendingRemovalId === scenario.id;

                return (
                  <article
                    key={scenario.id}
                    className={`rounded-2xl border p-5 transition-colors ${
                      isActive
                        ? "border-brand/25 bg-brand/[0.045]"
                        : "border-white/8 bg-white/[0.025]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {isActive ? (
                            <span className="rounded-full border border-brand/20 bg-brand/[0.08] px-2 py-1 font-mono text-[0.6rem] tracking-wider text-brand uppercase">
                              Active
                            </span>
                          ) : null}
                          <span className="text-xs text-muted">
                            Updated {formatShortDate(scenario.updatedAt)}
                          </span>
                        </div>
                        <h2 className="mt-3 truncate text-xl font-semibold text-white">
                          {scenario.title}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {scenario.role} · {scenario.destination}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-3xl font-medium tracking-tight text-white">
                          {projection.readinessMonths}
                        </p>
                        <p className="text-xs text-muted">months</p>
                      </div>
                    </div>

                    <dl className="mt-6 grid grid-cols-3 gap-2 border-y border-white/8 py-4">
                      <div>
                        <dt className="text-[0.68rem] text-muted">Readiness</dt>
                        <dd className="mt-1 text-sm font-semibold text-white">
                          {scenario.assumptions.currentReadiness}%
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.68rem] text-muted">
                          Weekly focus
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-white">
                          {scenario.assumptions.weeklyHours}h
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.68rem] text-muted">
                          Confidence
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-white capitalize">
                          {projection.confidence}
                        </dd>
                      </div>
                    </dl>

                    {isPendingRemoval ? (
                      <div
                        role="group"
                        aria-label={`Confirm removal of ${scenario.title}`}
                        className="mt-5 rounded-xl border border-rose-400/20 bg-rose-400/[0.05] p-3"
                      >
                        <p className="text-xs leading-5 text-rose-200">
                          Remove this scenario from this device? This cannot be
                          undone.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="secondary"
                            className="min-h-9 flex-1 text-xs"
                            onClick={() => setPendingRemovalId(null)}
                          >
                            Cancel
                          </Button>
                          <button
                            type="button"
                            className="min-h-9 flex-1 rounded-xl bg-rose-400 px-3 text-xs font-semibold text-slate-950 transition-colors hover:bg-rose-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
                            onClick={() =>
                              removeScenario(scenario.id, scenario.title)
                            }
                          >
                            Remove permanently
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 flex gap-2">
                        <Button
                          variant="secondary"
                          className="flex-1"
                          disabled={isActive}
                          onClick={() =>
                            setActiveScenario(scenario.id, scenario.title)
                          }
                        >
                          {isActive ? "Active scenario" : "Set as active"}
                        </Button>
                        <Button
                          variant="secondary"
                          className="px-3 text-rose-200 hover:border-rose-300/30 hover:bg-rose-300/[0.06]"
                          aria-label={`Remove ${scenario.title}`}
                          onClick={() => setPendingRemovalId(scenario.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
