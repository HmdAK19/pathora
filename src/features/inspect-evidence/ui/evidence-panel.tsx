"use client";

import { useCallback, useEffect, useState } from "react";

import {
  demoEvidenceRepository,
  type EvidenceBundle,
  type EvidenceRepository,
} from "@/entities/evidence";
import type { CareerScenario } from "@/entities/scenario";
import { Button } from "@/shared/ui/button";

interface EvidencePanelProps {
  repository?: EvidenceRepository;
  scenario: CareerScenario;
}

type EvidenceState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; bundle: EvidenceBundle };

const confidenceStyles = {
  low: "text-amber-200 bg-amber-300/10 border-amber-300/15",
  medium: "text-violet-200 bg-violet-300/10 border-violet-300/15",
  high: "text-brand bg-brand/10 border-brand/15",
} as const;

export function EvidencePanel({
  repository = demoEvidenceRepository,
  scenario,
}: EvidencePanelProps) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<EvidenceState>({ status: "loading" });

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((current) => current + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    void repository
      .getForScenario(scenario, { signal: controller.signal })
      .then((bundle) => {
        if (active) setState({ status: "ready", bundle });
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof DOMException && error.name === "AbortError")
          return;
        setState({ status: "error" });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [attempt, repository, scenario]);

  return (
    <section
      id="evidence"
      aria-labelledby="evidence-title"
      aria-busy={state.status === "loading"}
      className="rounded-2xl border border-white/8 bg-white/[0.025] p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.62rem] tracking-[0.2em] text-accent uppercase">
            Evidence engine
          </p>
          <h2
            id="evidence-title"
            className="mt-2 text-base font-semibold text-white"
          >
            Every number keeps its provenance
          </h2>
        </div>
        <span className="rounded-full border border-amber-300/15 bg-amber-300/[0.06] px-3 py-1 text-[0.65rem] text-amber-100">
          Modeled prototype · not live data
        </span>
      </div>

      {state.status === "loading" ? (
        <div
          className="mt-5 grid gap-3 sm:grid-cols-2"
          aria-label="Loading evidence"
        >
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-2xl border border-white/6 bg-white/[0.025] motion-reduce:animate-none"
            />
          ))}
        </div>
      ) : null}

      {state.status === "error" ? (
        <div
          role="alert"
          className="mt-5 rounded-2xl border border-red-300/15 bg-red-300/[0.05] p-4"
        >
          <p className="text-sm font-medium text-red-100">
            Evidence could not be loaded.
          </p>
          <p className="mt-1 text-xs text-slate-400">
            The scenario is safe. Retry the evidence adapter.
          </p>
          <Button variant="secondary" className="mt-3" onClick={retry}>
            Retry
          </Button>
        </div>
      ) : null}

      {state.status === "ready" ? (
        state.bundle.signals.length > 0 ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {state.bundle.signals.map((signal) => (
              <article
                key={signal.id}
                className="rounded-2xl border border-white/8 bg-black/10 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-muted">{signal.label}</p>
                    <p className="mt-1.5 text-lg font-semibold text-white">
                      {signal.value}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-1 text-[0.6rem] capitalize ${confidenceStyles[signal.confidence]}`}
                  >
                    {signal.confidence} confidence
                  </span>
                </div>
                <dl className="mt-4 space-y-2 border-t border-white/6 pt-3 text-xs leading-5">
                  <div>
                    <dt className="inline text-muted">Source: </dt>
                    <dd className="inline text-slate-300">{signal.source}</dd>
                  </div>
                  <div>
                    <dt className="inline text-muted">Method: </dt>
                    <dd className="inline text-slate-400">
                      {signal.methodology}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl border border-white/8 p-4 text-sm text-muted">
            No evidence is available for this scenario yet.
          </p>
        )
      ) : null}
    </section>
  );
}
