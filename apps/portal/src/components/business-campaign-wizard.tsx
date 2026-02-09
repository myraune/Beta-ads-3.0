"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BUSINESS_CATEGORIES,
  BUSINESS_COUNTRIES,
  BUSINESS_FORMATS,
  BUSINESS_LANGUAGES,
  BUSINESS_OBJECTIVES,
  DEFAULT_CAMPAIGN_WIZARD_STATE
} from "@/lib/business-mock";

function toggleSelection(values: string[], item: string): string[] {
  return values.includes(item) ? values.filter((value) => value !== item) : [...values, item];
}

export function BusinessCampaignWizard() {
  const [step, setStep] = useState(1);
  const [state, setState] = useState(DEFAULT_CAMPAIGN_WIZARD_STATE);

  const stepValid = useMemo(() => {
    if (step === 1) {
      return Boolean(state.name && state.advertiser && state.objective && state.budget && state.startDate && state.endDate);
    }

    if (step === 2) {
      return state.countries.length > 0 && state.languages.length > 0 && state.categories.length > 0;
    }

    return state.formats.length > 0;
  }, [state, step]);

  return (
    <div className="space-y-4">
      <section className="beta-panel">
        <p className="beta-panel-subtitle">Step {step} of 3</p>
        <h2 className="beta-panel-title">Campaign wizard</h2>
        <p className="beta-panel-subtitle">Create campaign metadata, targeting, and delivery format preferences.</p>

        {step === 1 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
              Campaign name
              <input className="beta-field mt-1" value={state.name} onChange={(event) => setState((prev) => ({ ...prev, name: event.target.value }))} />
            </label>
            <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
              Advertiser
              <input className="beta-field mt-1" value={state.advertiser} onChange={(event) => setState((prev) => ({ ...prev, advertiser: event.target.value }))} />
            </label>
            <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
              Objective
              <select className="beta-field mt-1" value={state.objective} onChange={(event) => setState((prev) => ({ ...prev, objective: event.target.value }))}>
                {BUSINESS_OBJECTIVES.map((objective) => (
                  <option key={objective} value={objective}>
                    {objective}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
              Budget
              <input className="beta-field mt-1" value={state.budget} onChange={(event) => setState((prev) => ({ ...prev, budget: event.target.value }))} />
            </label>
            <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
              Start date
              <input type="date" className="beta-field mt-1" value={state.startDate} onChange={(event) => setState((prev) => ({ ...prev, startDate: event.target.value }))} />
            </label>
            <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
              End date
              <input type="date" className="beta-field mt-1" value={state.endDate} onChange={(event) => setState((prev) => ({ ...prev, endDate: event.target.value }))} />
            </label>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <article>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Countries</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {BUSINESS_COUNTRIES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setState((prev) => ({ ...prev, countries: toggleSelection(prev.countries, item) }))}
                    className={`rounded-full border px-2 py-1 text-xs ${
                      state.countries.includes(item)
                        ? "border-rose-300/50 bg-rose-500/20 text-rose-100"
                        : "border-slate-600 bg-slate-900/70 text-slate-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </article>
            <article>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Languages</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {BUSINESS_LANGUAGES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setState((prev) => ({ ...prev, languages: toggleSelection(prev.languages, item) }))}
                    className={`rounded-full border px-2 py-1 text-xs ${
                      state.languages.includes(item)
                        ? "border-rose-300/50 bg-rose-500/20 text-rose-100"
                        : "border-slate-600 bg-slate-900/70 text-slate-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </article>
            <article>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Categories</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {BUSINESS_CATEGORIES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setState((prev) => ({ ...prev, categories: toggleSelection(prev.categories, item) }))}
                    className={`rounded-full border px-2 py-1 text-xs ${
                      state.categories.includes(item)
                        ? "border-rose-300/50 bg-rose-500/20 text-rose-100"
                        : "border-slate-600 bg-slate-900/70 text-slate-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </article>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-slate-300">Choose allowed creative formats and validate before launch.</p>
            <div className="flex flex-wrap gap-2">
              {BUSINESS_FORMATS.map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => setState((prev) => ({ ...prev, formats: toggleSelection(prev.formats, format) }))}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${
                    state.formats.includes(format)
                      ? "border-emerald-300/50 bg-emerald-500/20 text-emerald-100"
                      : "border-slate-600 bg-slate-900/70 text-slate-200"
                  }`}
                >
                  {format}
                </button>
              ))}
            </div>
            <div className="rounded-lg border border-slate-600/65 bg-slate-900/60 px-3 py-2 text-xs text-slate-300">
              Review summary, {state.name || "Untitled campaign"}, {state.objective}, {state.formats.join(", ") || "No formats"}
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep((prev) => Math.max(1, prev - 1))} className="beta-btn-ghost" disabled={step === 1}>
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep((prev) => Math.min(3, prev + 1))}
              className="beta-btn-primary"
              disabled={!stepValid || step === 3}
            >
              Next
            </button>
          </div>
          {step === 3 ? (
            <Link href="/business/campaigns" className="beta-btn-primary" aria-disabled={!stepValid}>
              Save draft campaign
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
