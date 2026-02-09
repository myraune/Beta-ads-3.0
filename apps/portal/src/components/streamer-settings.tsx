"use client";

import { useState } from "react";
import { STREAMER_SETTINGS_DATA } from "@/lib/streamer-mock";
import { useStreamerFlowState } from "@/lib/streamer-flow-store";
import { StatusPill } from "@/components/status-pill";

export function StreamerSettings() {
  const [profile, setProfile] = useState(STREAMER_SETTINGS_DATA.profile);
  const [preference, setPreference] = useState(STREAMER_SETTINGS_DATA.sponsorshipPreferences.autoAccept);
  const [selectedBrands] = useState(STREAMER_SETTINGS_DATA.sponsorshipPreferences.selectedBrands);
  const { state, setState } = useStreamerFlowState();

  return (
    <main className="space-y-4">
      <section className="streamer-card rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--streamer-muted)]">Settings</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Account and overlay preferences</h2>
          </div>
          <button type="button" className="streamer-primary-btn rounded-lg px-4 py-2 text-sm font-semibold text-white transition">
            Save
          </button>
        </div>
      </section>

      <section className="streamer-card rounded-2xl p-5">
        <h3 className="text-xl font-semibold text-white">Profile details</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
            Full name
            <input
              className="beta-field mt-1"
              value={profile.fullName}
              onChange={(event) => setProfile((prev) => ({ ...prev, fullName: event.target.value }))}
            />
          </label>
          <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
            Email
            <input
              className="beta-field mt-1"
              value={profile.email}
              onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))}
            />
          </label>
          <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
            Language
            <input
              className="beta-field mt-1"
              value={profile.language}
              onChange={(event) => setProfile((prev) => ({ ...prev, language: event.target.value }))}
            />
          </label>
          <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
            Country
            <input
              className="beta-field mt-1"
              value={profile.country}
              onChange={(event) => setProfile((prev) => ({ ...prev, country: event.target.value }))}
            />
          </label>
        </div>
      </section>

      <section className="streamer-card rounded-2xl p-5">
        <h3 className="text-xl font-semibold text-white">Platform connections</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {STREAMER_SETTINGS_DATA.platformConnections.map((connection) => (
            <article key={connection.provider} className="streamer-card-soft rounded-xl p-3">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-white">{connection.provider}</p>
              <div className="mt-2">
                <StatusPill tone={connection.connected ? "success" : "neutral"}>
                  {connection.connected ? "Connected" : "Not connected"}
                </StatusPill>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="streamer-card rounded-2xl p-5">
        <h3 className="text-xl font-semibold text-white">Sponsorship preferences</h3>
        <div className="mt-3 space-y-3">
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input type="radio" checked={preference === "all"} onChange={() => setPreference("all")} />
            Auto-accept all sponsorship offers
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input type="radio" checked={preference === "selected"} onChange={() => setPreference("selected")} />
            Auto-accept sponsorship offers from selected brands
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input type="radio" checked={preference === "manual"} onChange={() => setPreference("manual")} />
            Manual review of every sponsorship offer
          </label>

          <div className="rounded-lg border border-white/15 bg-black/25 p-3 text-sm text-slate-300">
            Selected brands: {selectedBrands.join(", ")}
          </div>
        </div>
      </section>

      <section className="streamer-card rounded-2xl p-5">
        <h3 className="text-xl font-semibold text-white">Overlay service controls</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="flex items-center justify-between rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm text-slate-200">
            Overlay service enabled
            <input
              type="checkbox"
              checked={state.overlayServiceEnabled}
              onChange={(event) => setState((prev) => ({ ...prev, overlayServiceEnabled: event.target.checked }))}
            />
          </label>

          <label className="flex items-center justify-between rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm text-slate-200">
            Placement mode
            <select
              className="beta-field w-[160px]"
              value={state.overlayPlacementMode}
              onChange={(event) =>
                setState((prev) => ({
                  ...prev,
                  overlayPlacementMode: event.target.value === "manual" ? "manual" : "automatic"
                }))
              }
            >
              <option value="automatic">Automatic</option>
              <option value="manual">Manual</option>
            </select>
          </label>

          <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
            Minimum cooldown (minutes)
            <input
              type="range"
              min={10}
              max={60}
              value={state.minimumCooldownMinutes}
              onChange={(event) => setState((prev) => ({ ...prev, minimumCooldownMinutes: Number(event.target.value) }))}
              className="mt-1 w-full"
            />
            <span className="text-sm text-slate-200">{state.minimumCooldownMinutes} min</span>
          </label>

          <label className="text-xs uppercase tracking-[0.12em] text-slate-400">
            Start delay (minutes)
            <input
              type="range"
              min={5}
              max={60}
              value={state.startDelayMinutes}
              onChange={(event) => setState((prev) => ({ ...prev, startDelayMinutes: Number(event.target.value) }))}
              className="mt-1 w-full"
            />
            <span className="text-sm text-slate-200">{state.startDelayMinutes} min</span>
          </label>
        </div>
      </section>
    </main>
  );
}
