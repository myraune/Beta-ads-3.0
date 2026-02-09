"use client";

import { useMemo, useState } from "react";
import { BUSINESS_CATEGORIES, BUSINESS_COUNTRIES, BUSINESS_STREAMERS } from "@/lib/business-mock";
import { StatusPill } from "@/components/status-pill";

export function BusinessStreamerExplorer() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const results = useMemo(() => {
    return BUSINESS_STREAMERS.filter((streamer) => {
      const queryMatch = query ? streamer.handle.toLowerCase().includes(query.toLowerCase()) : true;
      const countryMatch = country === "all" ? true : streamer.country === country;
      const categoryMatch = category === "all" ? true : streamer.categories.includes(category);
      const verifiedMatch = verifiedOnly ? streamer.verified : true;
      return queryMatch && countryMatch && categoryMatch && verifiedMatch;
    });
  }, [category, country, query, verifiedOnly]);

  return (
    <div className="space-y-4">
      <section className="beta-panel">
        <h2 className="beta-panel-title">Streamer explorer</h2>
        <p className="beta-panel-subtitle">Filter creators by category, market, and reliability score.</p>

        <div className="mt-4 grid gap-2 md:grid-cols-4">
          <input className="beta-field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search handle" />
          <select className="beta-field" value={country} onChange={(event) => setCountry(event.target.value)}>
            <option value="all">All countries</option>
            {BUSINESS_COUNTRIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <select className="beta-field" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All categories</option>
            {BUSINESS_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <label className="inline-flex items-center justify-between rounded-xl border border-slate-600/60 bg-slate-900/70 px-3 py-2 text-sm text-slate-200">
            Verified only
            <input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} />
          </label>
        </div>
      </section>

      <section className="beta-panel">
        <div className="flex items-center justify-between gap-2">
          <h3 className="beta-panel-title">Results</h3>
          <StatusPill tone="info">{results.length} streamers</StatusPill>
        </div>

        {results.length === 0 ? (
          <p className="mt-3 text-sm text-slate-300">No streamers match the selected filters.</p>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {results.map((streamer) => (
              <article key={streamer.id} className="rounded-xl border border-slate-600/55 bg-slate-900/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-lg font-semibold text-white">{streamer.handle}</p>
                  <StatusPill tone={streamer.verified ? "success" : "warning"}>{streamer.verified ? "verified" : "pending"}</StatusPill>
                </div>
                <p className="mt-1 text-sm text-slate-300">
                  {streamer.country} , {streamer.language}
                </p>
                <p className="mt-1 text-sm text-slate-300">Avg viewers, {streamer.avgViewers}</p>
                <p className="mt-1 text-sm text-slate-300">Tier, {streamer.pricingTier}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {streamer.categories.map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-600 bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.12em] text-cyan-200">Reliability score, {streamer.score}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
