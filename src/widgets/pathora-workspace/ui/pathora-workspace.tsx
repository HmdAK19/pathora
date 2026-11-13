"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import {
  browserScenarioStore,
  demoCareerScenario,
  parseScenarioCollection,
} from "@/entities/scenario";
import { EvidencePanel } from "@/features/inspect-evidence";
import { ScenarioSimulator } from "@/features/simulate-career-path";
import { BrandMark } from "@/shared/ui/brand-mark";

const navigation = [
  { label: "Overview", symbol: "⌂", href: "#main-content", active: true },
  {
    label: "Scenarios",
    symbol: "◇",
    href: "/scenarios",
    active: false,
    count: "scenarios",
  },
  { label: "Timeline", symbol: "↝", href: "#checkpoint", active: false },
  {
    label: "Evidence",
    symbol: "◫",
    href: "#evidence",
    active: false,
    count: 4,
  },
] as const;

export function PathoraWorkspace() {
  const scenarioSnapshot = useSyncExternalStore(
    (listener) => browserScenarioStore.subscribe(listener),
    () => browserScenarioStore.getSnapshot(),
    () => null,
  );
  const scenarioCollection = parseScenarioCollection(scenarioSnapshot);
  const activeScenario =
    scenarioCollection.scenarios.find(
      (scenario) => scenario.id === scenarioCollection.activeScenarioId,
    ) ?? demoCareerScenario;
  const marketDemandLabel =
    activeScenario.assumptions.marketDemand >= 70
      ? "High"
      : activeScenario.assumptions.marketDemand >= 40
        ? "Moderate"
        : "Low";
  const planConsistency = Math.min(
    100,
    Math.round(activeScenario.assumptions.weeklyHours * 7),
  );
  const signals = [
    {
      label: "Skill coverage",
      value: `${activeScenario.assumptions.currentReadiness}%`,
      trend: "live",
    },
    {
      label: "Market demand",
      value: marketDemandLabel,
      trend: `${activeScenario.assumptions.marketDemand}`,
    },
    {
      label: "Plan consistency",
      value: `${planConsistency}%`,
      trend: `${activeScenario.assumptions.weeklyHours}h/w`,
    },
  ] as const;

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[100rem] px-3 py-3 sm:px-5 sm:py-5">
      <div className="grid min-h-[calc(100dvh-1.5rem)] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#090d16]/92 shadow-[0_30px_120px_rgba(0,0,0,0.45)] sm:min-h-[calc(100dvh-2.5rem)] lg:grid-cols-[15rem_1fr]">
        <aside className="hidden border-r border-white/8 bg-black/10 p-5 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 px-1">
            <BrandMark />
            <div>
              <p className="font-semibold tracking-tight text-white">Pathora</p>
              <p className="text-[0.65rem] text-muted">Decision intelligence</p>
            </div>
          </div>

          <nav aria-label="Workspace" className="mt-9 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-label={item.label}
                aria-current={item.active ? "page" : undefined}
                className={`flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  item.active
                    ? "bg-white/[0.07] font-medium text-white"
                    : "text-muted hover:bg-white/[0.04] hover:text-slate-200"
                }`}
              >
                <span className="w-4 text-center text-base" aria-hidden="true">
                  {item.symbol}
                </span>
                <span>{item.label}</span>
                {"count" in item ? (
                  <span className="ml-auto rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.62rem]">
                    {item.count === "scenarios"
                      ? scenarioCollection.scenarios.length
                      : item.count}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/8 bg-white/[0.025] p-4">
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full bg-brand shadow-[0_0_10px_var(--brand)]"
                aria-hidden="true"
              />
              <p className="text-xs font-medium text-slate-300">
                Evidence sync active
              </p>
            </div>
            <p className="mt-2 text-[0.68rem] leading-5 text-muted">
              Prototype adapter · 4 traceable signals
            </p>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="flex min-h-16 items-center justify-between border-b border-white/8 px-4 sm:px-7">
            <div className="flex items-center gap-3 lg:hidden">
              <BrandMark className="size-7" />
              <span className="font-semibold text-white">Pathora</span>
            </div>
            <div className="hidden items-center gap-2 text-xs text-muted lg:flex">
              <span>Career paths</span>
              <span aria-hidden="true">/</span>
              <span className="text-slate-300">{activeScenario.title}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/scenarios"
                className="rounded-lg px-2 py-1.5 text-xs font-medium text-muted transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:hidden"
              >
                Scenarios
              </Link>
              <span className="hidden rounded-full border border-white/10 px-3 py-1.5 font-mono text-[0.63rem] tracking-widest text-muted uppercase sm:inline-flex">
                Model v0.1
              </span>
              <div
                className="grid size-8 place-items-center rounded-full bg-[linear-gradient(135deg,#d9ffb8,#8b7bff)] text-xs font-bold text-slate-950"
                aria-label="Signed in as HM"
              >
                HM
              </div>
            </div>
          </header>

          <main
            id="main-content"
            className="mx-auto max-w-[85rem] p-4 sm:p-7 lg:p-9"
          >
            <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div
                  aria-label={`Active scenario: ${activeScenario.title}`}
                  className="mb-3 flex flex-wrap items-center gap-2"
                >
                  <span className="rounded-full border border-brand/20 bg-brand/[0.07] px-2.5 py-1 font-mono text-[0.62rem] tracking-wider text-brand uppercase">
                    Active scenario
                  </span>
                  <span className="text-xs text-muted">
                    {activeScenario.title}
                  </span>
                </div>
                <h1 className="max-w-3xl text-3xl font-medium tracking-[-0.045em] text-white sm:text-4xl">
                  Build a credible path to your next role.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">
                  {activeScenario.role} · {activeScenario.destination}
                </p>
                <Link
                  href="/scenarios/new?step=intent"
                  className="mt-5 inline-flex min-h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-brand-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  New scenario
                </Link>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted">
                <div
                  className="flex -space-x-2"
                  aria-label="Three collaborators"
                >
                  {[
                    ["AK", "bg-indigo-300"],
                    ["NS", "bg-cyan-200"],
                    ["+1", "bg-slate-700 text-white"],
                  ].map(([initials, className]) => (
                    <span
                      key={initials}
                      className={`grid size-8 place-items-center rounded-full border-2 border-[#090d16] text-[0.62rem] font-bold text-slate-950 ${className}`}
                    >
                      {initials}
                    </span>
                  ))}
                </div>
                <span>Private workspace</span>
              </div>
            </div>

            <section
              aria-label="Scenario signals"
              className="mb-4 grid gap-3 sm:grid-cols-3"
            >
              {signals.map((signal) => (
                <article
                  key={signal.label}
                  className="rounded-2xl border border-white/8 bg-white/[0.025] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted">{signal.label}</p>
                    <span className="font-mono text-[0.62rem] text-brand">
                      {signal.trend}
                    </span>
                  </div>
                  <p className="mt-2 text-xl font-medium tracking-tight text-white">
                    {signal.value}
                  </p>
                </article>
              ))}
            </section>

            <ScenarioSimulator
              key={activeScenario.id}
              scenario={activeScenario}
            />

            <section
              aria-label="Evidence and next checkpoint"
              className="mt-4 grid gap-4 lg:grid-cols-[1fr_20rem]"
            >
              <EvidencePanel
                key={activeScenario.id}
                scenario={activeScenario}
              />

              <div
                id="checkpoint"
                className="rounded-2xl border border-white/8 bg-[linear-gradient(135deg,rgba(167,246,90,0.07),rgba(255,255,255,0.02))] p-5"
              >
                <p className="text-xs text-muted">Next decision checkpoint</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  Portfolio review
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Recalibrate after two production-grade case studies.
                </p>
                <p className="mt-5 font-mono text-[0.68rem] tracking-wider text-brand uppercase">
                  In 6 weeks →
                </p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
