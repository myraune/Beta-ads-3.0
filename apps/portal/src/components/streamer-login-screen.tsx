"use client";

import { useState } from "react";
import { useStreamerFlowState } from "@/lib/streamer-flow-store";
import type { ConnectProvider } from "@/types/streamer";

interface StreamerLoginScreenProps {
  onConnected?: () => void;
}

const BRAND_TILES = [
  "NIMBUS",
  "ARCWIRE",
  "IONFRAME",
  "VOIDBOX",
  "NORTHFORGE",
  "SPECTRA",
  "CIRCUIT",
  "LAYER7"
];

export function StreamerLoginScreen(props: StreamerLoginScreenProps) {
  const { state, setState } = useStreamerFlowState();
  const [pendingProvider, setPendingProvider] = useState<ConnectProvider | null>(null);

  const connectProvider = (provider: ConnectProvider) => {
    setPendingProvider(provider);
    setState((previous) => ({
      ...previous,
      providerConnected: true,
      connectedProvider: provider
    }));
    setPendingProvider(null);
    props.onConnected?.();
  };

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <article className="streamer-surface-card streamer-beta-grid rounded-3xl p-6 md:p-8">
        <p className="streamer-surface-chip inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          Streamer access
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-heading)] text-4xl font-semibold tracking-tight text-ink md:text-5xl">
          Connect, launch, monetize
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-ink/75">
          Sign in with your streaming platform to access sponsorships, setup your OBS source, and run active campaign workspaces.
        </p>

        <div className="mt-6 space-y-3 max-w-md">
          <button
            type="button"
            onClick={() => connectProvider("twitch")}
            className="streamer-primary-btn w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition"
            aria-label="Login with Twitch"
          >
            {pendingProvider === "twitch" ? "Connecting Twitch..." : "Login with Twitch"}
          </button>
          <button
            type="button"
            className="w-full cursor-not-allowed rounded-xl border border-slate-300 bg-slate-100/95 px-4 py-3 text-sm font-semibold text-slate-500"
            disabled
            aria-label="Login with YouTube"
          >
            Login with YouTube (soon)
          </button>
          <button
            type="button"
            className="w-full cursor-not-allowed rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-500"
            disabled
            aria-label="Login with Kick"
          >
            Login with Kick (soon)
          </button>
        </div>

        <div className="mt-5 max-w-md rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold">Connection status</p>
          <p className="mt-1">
            {state.providerConnected && state.connectedProvider
              ? `Connected with ${state.connectedProvider}.`
              : "No provider connected yet."}
          </p>
        </div>
      </article>

      <article className="streamer-hero-panel rounded-3xl p-6 md:p-8">
        <p className="inline-flex rounded-full border border-white/70 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
          Beta network
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight text-slate-900">
          Brands active on Beta Live Ads
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-700">
          After connecting Twitch, you can browse available campaigns, complete OBS setup, and activate your campaign workspace.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {BRAND_TILES.map((brand) => (
            <div
              key={brand}
              className="rounded-xl border border-white/70 bg-white/90 px-3 py-4 text-center text-sm font-semibold tracking-wide text-slate-800 shadow-sm"
            >
              {brand}
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
