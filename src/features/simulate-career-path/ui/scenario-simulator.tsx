"use client";

import { useState } from "react";

import {
  demoCareerScenario,
  type CareerScenario,
  type ScenarioAssumptions,
} from "@/entities/scenario";
import { formatEuro } from "@/shared/lib/formatters";
import { Button } from "@/shared/ui/button";

import { calculateCareerProjection } from "../model/calculate-career-projection";

type NumericAssumption = "currentReadiness" | "weeklyHours" | "marketDemand";

interface RangeControlProps {
  label: string;
  name: NumericAssumption;
  min: number;
  max: number;
  suffix: string;
  value: number;
  onChange: (name: NumericAssumption, value: number) => void;
}

function RangeControl({
  label,
  name,
  min,
  max,
  suffix,
  value,
  onChange,
}: RangeControlProps) {
  const id = `assumption-${name}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium text-slate-300">
          {label}
        </label>
        <output
          htmlFor={id}
          className="min-w-14 rounded-lg border border-white/8 bg-white/[0.04] px-2.5 py-1 text-right font-mono text-xs text-white"
        >
          {value}
          {suffix}
        </output>
      </div>
      <input
        id={id}
        name={name}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(name, event.currentTarget.valueAsNumber)}
        className="w-full"
      />
    </div>
  );
}

interface ScenarioSimulatorProps {
  scenario?: CareerScenario;
}

export function ScenarioSimulator({
  scenario = demoCareerScenario,
}: ScenarioSimulatorProps) {
  const initialAssumptions = scenario.assumptions;
  const [assumptions, setAssumptions] =
    useState<ScenarioAssumptions>(initialAssumptions);
  const projection = calculateCareerProjection(assumptions);
  const ringOffset = 289 - (289 * projection.evidenceScore) / 100;

  const updateAssumption = (name: NumericAssumption, value: number) => {
    setAssumptions((current) => ({ ...current, [name]: value }));
  };

  return (
    <section
      aria-labelledby="simulator-title"
      className="grid overflow-hidden rounded-3xl border border-white/10 bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.28)] lg:grid-cols-[1.05fr_0.95fr]"
    >
      <div className="border-b border-white/8 p-5 sm:p-7 lg:border-r lg:border-b-0">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 font-mono text-[0.68rem] tracking-[0.22em] text-brand uppercase">
              Live assumption model
            </p>
            <h2
              id="simulator-title"
              className="text-xl font-semibold tracking-tight text-white"
            >
              Adjust the path
            </h2>
          </div>
          <Button
            variant="secondary"
            className="min-h-8 px-3 text-xs"
            onClick={() => setAssumptions(initialAssumptions)}
          >
            Reset
          </Button>
        </div>

        <div className="space-y-7">
          <RangeControl
            label="Current readiness"
            name="currentReadiness"
            min={20}
            max={90}
            suffix="%"
            value={assumptions.currentReadiness}
            onChange={updateAssumption}
          />
          <RangeControl
            label="Focused learning"
            name="weeklyHours"
            min={2}
            max={30}
            suffix="h"
            value={assumptions.weeklyHours}
            onChange={updateAssumption}
          />
          <RangeControl
            label="Market demand signal"
            name="marketDemand"
            min={20}
            max={100}
            suffix="%"
            value={assumptions.marketDemand}
            onChange={updateAssumption}
          />
        </div>

        <p className="mt-8 border-t border-white/8 pt-5 text-xs leading-5 text-muted">
          This prototype exposes every assumption. Outcomes are ranges, not
          promises, and should be recalibrated as new evidence arrives.
        </p>
      </div>

      <div className="relative flex min-h-[23rem] flex-col justify-between overflow-hidden bg-[linear-gradient(145deg,rgba(139,123,255,0.10),transparent_55%)] p-5 sm:p-7">
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-20 size-64 rounded-full bg-accent/10 blur-3xl"
        />

        <div className="relative flex items-start justify-between gap-5">
          <div>
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
          </div>

          <div
            className="relative grid size-24 shrink-0 place-items-center"
            aria-hidden="true"
          >
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 104 104">
              <circle
                cx="52"
                cy="52"
                r="46"
                fill="none"
                stroke="rgba(255,255,255,.07)"
                strokeWidth="7"
              />
              <circle
                cx="52"
                cy="52"
                r="46"
                fill="none"
                stroke="var(--brand)"
                strokeLinecap="round"
                strokeWidth="7"
                strokeDasharray="289"
                strokeDashoffset={ringOffset}
              />
            </svg>
            <span className="font-mono text-lg font-semibold text-white">
              {projection.evidenceScore}
            </span>
          </div>
        </div>

        <dl className="relative grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
            <dt className="text-xs text-muted">Confidence</dt>
            <dd className="mt-2 flex items-center gap-2 text-sm font-semibold text-white capitalize">
              <span
                className="size-2 rounded-full bg-brand"
                aria-hidden="true"
              />
              {projection.confidence}
            </dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4">
            <dt className="text-xs text-muted">Learning investment</dt>
            <dd className="mt-2 text-sm font-semibold text-white">
              {formatEuro(projection.estimatedInvestment)}
            </dd>
          </div>
        </dl>

        <div className="relative mt-4 flex items-center gap-3 rounded-2xl border border-brand/15 bg-brand/[0.06] p-4">
          <span
            className="grid size-8 shrink-0 place-items-center rounded-full bg-brand/10 text-brand"
            aria-hidden="true"
          >
            ↗
          </span>
          <p className="text-xs leading-5 text-slate-300">
            Adding two focused hours per week currently has the strongest
            leverage on this plan.
          </p>
        </div>
      </div>
    </section>
  );
}
