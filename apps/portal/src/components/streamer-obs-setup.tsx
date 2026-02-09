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
            <h1 className="mt-3 font-[family-name:var(--font-heading)] text-5xl font-semibold tracking-tight text-ink">OBS setup</h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/75">
              Configure one browser source and keep it enabled across scenes. After setup, run the test animation to verify visibility.
            </p>
          </div>

          <div className="grid gap-3">
            <article className="streamer-outline-card rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Display test animation</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
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
                <span className="text-slate-700" data-testid="obs-test-status">
                  {testStatus}
                </span>
              </p>
            </article>

            <article className="streamer-outline-card rounded-2xl p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Connection status</p>
              <p className="mt-2 text-sm text-slate-700">Link in streaming software:</p>
              <span
                data-testid="obs-connection-status"
                className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
                  state.overlayConnected ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                }`}
              >
                {state.overlayConnected ? "active" : "inactive"}
              </span>
              {state.lastTestRunAt ? (
                <p className="mt-2 text-xs text-slate-500">Last test: {new Date(state.lastTestRunAt).toLocaleString("en-US", { timeZone: "UTC" })} UTC</p>
              ) : null}
            </article>
          </div>
        </div>
      </section>

      {!state.providerConnected ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
          Connect Twitch before running setup actions.
          <Link href="/streamer/login" className="ml-2 font-semibold underline">
            Go to login
          </Link>
        </div>
      ) : null}

      <section className="streamer-surface-card rounded-3xl p-6">
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
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
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight text-ink">{selectedTab.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/75">{selectedTab.intro}</p>
            <ul className="mt-4 space-y-2">
              {selectedTab.steps.map((step) => (
                <li key={step} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {step}
                </li>
              ))}
            </ul>
            {selectedTab.note ? (
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">{selectedTab.note}</p>
            ) : null}
          </article>

          <article className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Source snippet</p>
            <p className="mt-2 text-xs leading-relaxed text-cyan-900">{STREAMER_SOURCE_SNIPPET}</p>
            <button
              type="button"
              onClick={copySnippet}
              className="mt-3 w-full rounded-lg border border-cyan-300 bg-white px-3 py-2 text-sm font-semibold text-cyan-700 transition hover:border-cyan-400"
              aria-label="Copy source snippet"
            >
              Copy snippet
            </button>
            {copyStatus === "copied" ? <p className="mt-2 text-xs text-emerald-700">Snippet copied.</p> : null}
            {copyStatus === "unavailable" ? <p className="mt-2 text-xs text-amber-700">Clipboard not available.</p> : null}

            <div className="mt-5 rounded-xl border border-dashed border-cyan-300 bg-white/70 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">Drag and drop simulator</p>
              <p className="mt-2 text-sm text-cyan-900">Drop the snippet into OBS to auto-create browser source settings.</p>
            </div>
          </article>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/streamer" className="streamer-ghost-btn rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
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
