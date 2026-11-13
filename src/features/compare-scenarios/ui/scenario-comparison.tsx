"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import {
  browserScenarioStore,
  parseScenarioCollection,
  type ScenarioStore,
} from "@/entities/scenario";
import { formatEuro } from "@/shared/lib/formatters";
import { BrandMark } from "@/shared/ui/brand-mark";

import { compareCareerScenarios } from "../model/compare-career-scenarios";

interface ScenarioComparisonProps {
  scenarioStore?: ScenarioStore;
}

export function ScenarioComparison({
  scenarioStore = browserScenarioStore,
}: ScenarioComparisonProps) {
  const snapshot = useSyncExternalStore(
    (listener) => scenarioStore.subscribe(listener),
    () => scenarioStore.getSnapshot(),
    () => null,
  );
  const collection = parseScenarioCollection(snapshot);
  const [selection, setSelection] = useState<string[] | null>(null);
  const availableIds = new Set(
    collection.scenarios.map((scenario) => scenario.id),
  );
  const selectedIds = (
    selection ?? collection.scenarios.slice(0, 3).map(({ id }) => id)
  ).filter((id) => availableIds.has(id));
  const selectedScenarios = collection.scenarios.filter((scenario) =>
    selectedIds.includes(scenario.id),
  );
  const comparison = compareCareerScenarios(selectedScenarios);

  const toggleScenario = (id: string) => {
    setSelection((currentSelection) => {
      const current = currentSelection ?? selectedIds;
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  };

  return (
    <main id="main-content" className="min-h-dvh px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto min-h-[calc(100dvh-2rem)] max-w-7xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#090d16]/92 shadow-[0_30px_120px_rgba(0,0,0,0.45)] sm:min-h-[calc(100dvh-3rem)]">
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
            href="/scenarios"
            className="rounded-lg px-2 py-2 text-sm text-muted transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Scenario library
          </Link>
        </header>

        <section
          className="p-5 sm:p-7 lg:p-9"
          aria-labelledby="comparison-title"
        >
          <div className="max-w-3xl">
            <p className="font-mono text-[0.65rem] tracking-[0.2em] text-brand uppercase">
              Decision workbench
            </p>
            <h1
              id="comparison-title"
              className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl"
            >
              Compare futures, not just numbers.
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              Select up to three paths. The recommendation balances evidence,
              market demand, time to readiness, and learning investment.
            </p>
          </div>

          {collection.scenarios.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-white/12 p-8 text-center sm:p-12">
              <h2 className="text-xl font-semibold text-white">
                Create a scenario before comparing
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                Your saved paths will appear here as soon as the first scenario
                is created.
              </p>
              <Link
                href="/scenarios/new?step=intent"
                className="mt-6 inline-flex min-h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                Create scenario
              </Link>
            </div>
          ) : (
            <>
              <fieldset className="mt-8 rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                <legend className="px-2 text-xs font-medium text-slate-300">
                  Paths to compare · {selectedIds.length}/3 selected
                </legend>
                <div className="mt-1 flex flex-wrap gap-2">
                  {collection.scenarios.map((scenario) => {
                    const checked = selectedIds.includes(scenario.id);
                    const disabled = !checked && selectedIds.length >= 3;
                    return (
                      <label
                        key={scenario.id}
                        className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm transition-colors ${checked ? "border-brand/25 bg-brand/[0.07] text-white" : "border-white/8 text-muted"} ${disabled ? "cursor-not-allowed opacity-45" : "hover:border-white/15"}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleScenario(scenario.id)}
                          className="accent-[var(--brand)]"
                        />
                        {scenario.title}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {comparison.length < 2 ? (
                <div
                  role="status"
                  className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-5 text-sm text-amber-100"
                >
                  Select at least two scenarios to reveal the comparative
                  recommendation.
                </div>
              ) : (
                <div className="mt-5 grid gap-4 lg:grid-cols-3">
                  {comparison.map(
                    ({ scenario, projection, overallScore }, index) => (
                      <article
                        key={scenario.id}
                        className={`relative overflow-hidden rounded-3xl border p-5 ${index === 0 ? "border-brand/30 bg-brand/[0.055]" : "border-white/8 bg-white/[0.025]"}`}
                      >
                        {index === 0 ? (
                          <span className="absolute top-0 right-0 rounded-bl-xl bg-brand px-3 py-1.5 font-mono text-[0.6rem] font-semibold tracking-wider text-slate-950 uppercase">
                            Best balance
                          </span>
                        ) : null}
                        <p className="pr-20 text-xs text-muted">
                          #{index + 1} · score {overallScore}
                        </p>
                        <h2 className="mt-3 text-xl font-semibold text-white">
                          {scenario.title}
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                          {scenario.role} · {scenario.destination}
                        </p>
                        <dl className="mt-6 grid grid-cols-2 gap-3">
                          <div className="rounded-xl border border-white/7 bg-black/10 p-3">
                            <dt className="text-[0.68rem] text-muted">
                              Readiness
                            </dt>
                            <dd className="mt-1 font-semibold text-white">
                              {projection.readinessMonths} months
                            </dd>
                          </div>
                          <div className="rounded-xl border border-white/7 bg-black/10 p-3">
                            <dt className="text-[0.68rem] text-muted">
                              Evidence
                            </dt>
                            <dd className="mt-1 font-semibold text-white">
                              {projection.evidenceScore}/100
                            </dd>
                          </div>
                          <div className="rounded-xl border border-white/7 bg-black/10 p-3">
                            <dt className="text-[0.68rem] text-muted">
                              Investment
                            </dt>
                            <dd className="mt-1 font-semibold text-white">
                              {formatEuro(projection.estimatedInvestment)}
                            </dd>
                          </div>
                          <div className="rounded-xl border border-white/7 bg-black/10 p-3">
                            <dt className="text-[0.68rem] text-muted">
                              Confidence
                            </dt>
                            <dd className="mt-1 font-semibold text-white capitalize">
                              {projection.confidence}
                            </dd>
                          </div>
                        </dl>
                        <div
                          className="mt-5"
                          aria-label={`Evidence score ${projection.evidenceScore} out of 100`}
                        >
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/7">
                            <div
                              className="h-full rounded-full bg-brand"
                              style={{ width: `${projection.evidenceScore}%` }}
                            />
                          </div>
                        </div>
                      </article>
                    ),
                  )}
                </div>
              )}
              <p className="mt-5 text-xs leading-5 text-muted">
                Scores are decision aids, not predictions. A lower-ranked path
                may still be right when personal priorities differ from the
                current weighting.
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
