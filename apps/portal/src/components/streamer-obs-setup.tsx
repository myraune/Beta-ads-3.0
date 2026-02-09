"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { STREAMER_SETUP_GUIDE_TABS, STREAMER_SOURCE_SNIPPET } from "@/lib/streamer-mock";
import { useStreamerFlowState } from "@/lib/streamer-flow-store";
import type { SetupGuideTab } from "@/types/streamer";

type TestStatus = "idle" | "running" | "visible";

function nextTestStatus(status: TestStatus): TestStatus {
  if (status === "idle") {
    return "running";
  }
  if (status === "running") {
    return "visible";
  }
  return "idle";
}

export function StreamerObsSetup() {
  const { state, setState } = useStreamerFlowState();
  const [activeTab, setActiveTab] = useState<SetupGuideTab["id"]>("drag-drop");
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "unavailable">("idle");

  const selectedTab = useMemo(
    () => STREAMER_SETUP_GUIDE_TABS.find((tab) => tab.id === activeTab) ?? STREAMER_SETUP_GUIDE_TABS[0],
    [activeTab]
  );

  const runTestAnimation = () => {
    const next = nextTestStatus(testStatus);
    setTestStatus(next);

    if (next === "visible") {
      setState((previous) => ({
        ...previous,
        setupCompleted: true,
        overlayConnected: true,
        lastTestRunAt: new Date().toISOString()
      }));
      return;
    }

    if (next === "idle") {
      setState((previous) => ({
        ...previous,
        overlayConnected: false
      }));
      return;
    }

    setState((previous) => ({
      ...previous,
      overlayConnected: false
    }));
  };

  const copySnippet = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyStatus("unavailable");
      return;
    }

    await navigator.clipboard.writeText(STREAMER_SOURCE_SNIPPET);
    setCopyStatus("copied");
  };

  return (
    <main className="space-y-6">
      <section className="streamer-surface-card streamer-beta-grid rounded-3xl p-6 md:p-8">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <p className="streamer-surface-chip inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
              Streaming code
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-heading)] text-5xl font-semibold tracking-tight text-slate-50">OBS setup</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300">
              Configure one browser source and keep it enabled across scenes. After setup, run the test animation to verify visibility.
            </p>
          </div>

          <div className="grid gap-3">
            <article className="streamer-outline-card rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Display test animation</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Open OBS, then run the test animation and confirm it appears in every live scene.
              </p>
              <button
                type="button"
                onClick={runTestAnimation}
                className="streamer-primary-btn mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white transition"
                aria-label="Run test animation"
                disabled={!state.providerConnected}
              >
                Run test animation
              </button>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status:{" "}
                <span className="text-cyan-200" data-testid="obs-test-status">
                  {testStatus}
                </span>
              </p>
            </article>

            <article className="streamer-outline-card rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Connection status</p>
              <p className="mt-2 text-sm text-slate-300">Link in streaming software:</p>
              <span
                data-testid="obs-connection-status"
                className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
                  state.overlayConnected ? "bg-emerald-500/20 text-emerald-200" : "bg-rose-500/20 text-rose-200"
                }`}
              >
                {state.overlayConnected ? "active" : "inactive"}
              </span>
              {state.lastTestRunAt ? (
                <p className="mt-2 text-xs text-slate-400">Last test: {new Date(state.lastTestRunAt).toLocaleString("en-US", { timeZone: "UTC" })} UTC</p>
              ) : null}
            </article>
          </div>
        </div>
      </section>

      {!state.providerConnected ? (
        <div className="rounded-2xl border border-amber-300/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 shadow-sm">
          Connect Twitch before running setup actions.
          <Link href="/streamer/login" className="ml-2 font-semibold underline">
            Go to login
          </Link>
        </div>
      ) : null}

      <section className="streamer-surface-card rounded-3xl p-6">
        <div className="flex flex-wrap gap-2 border-b border-slate-700/60 pb-3">
          {STREAMER_SETUP_GUIDE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`streamer-tab-btn rounded-lg px-3 py-2 text-sm font-semibold transition ${
                tab.id === activeTab ? "streamer-tab-btn-active" : ""
              }`}
              data-testid={`setup-tab-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <article>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight text-slate-50">{selectedTab.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{selectedTab.intro}</p>
            <ul className="mt-4 space-y-2">
              {selectedTab.steps.map((step) => (
                <li key={step} className="rounded-xl border border-slate-700 bg-slate-950/55 px-3 py-2 text-sm text-slate-200">
                  {step}
                </li>
              ))}
            </ul>
            {selectedTab.note ? (
              <p className="mt-3 rounded-xl border border-amber-300/35 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">{selectedTab.note}</p>
            ) : null}
          </article>

          <article className="rounded-2xl border border-cyan-300/30 bg-cyan-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Source snippet</p>
            <p className="mt-2 text-xs leading-relaxed text-cyan-100">{STREAMER_SOURCE_SNIPPET}</p>
            <button
              type="button"
              onClick={copySnippet}
              className="mt-3 w-full rounded-lg border border-cyan-300/50 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300"
              aria-label="Copy source snippet"
            >
              Copy snippet
            </button>
            {copyStatus === "copied" ? <p className="mt-2 text-xs text-emerald-200">Snippet copied.</p> : null}
            {copyStatus === "unavailable" ? <p className="mt-2 text-xs text-amber-200">Clipboard not available.</p> : null}

            <div className="mt-5 rounded-xl border border-dashed border-cyan-300/40 bg-slate-950/35 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Drag and drop simulator</p>
              <p className="mt-2 text-sm text-cyan-100">Drop the snippet into OBS to auto-create browser source settings.</p>
            </div>
          </article>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/streamer" className="streamer-ghost-btn rounded-lg px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/60">
            Back to sponsorships
          </Link>
          <Link href="/streamer/workspace" className="streamer-primary-btn rounded-lg px-4 py-2 text-sm font-semibold text-white transition">
            Open campaign workspace
          </Link>
        </div>
      </section>
    </main>
  );
}
