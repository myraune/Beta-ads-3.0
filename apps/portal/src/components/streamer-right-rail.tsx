import type { StreamerRightRailProps, WorkflowStepStatus } from "@/types/streamer";

function stepDotClasses(status: WorkflowStepStatus): string {
  if (status === "complete") {
    return "border-emerald-300/80 bg-emerald-500 text-white";
  }

  if (status === "active") {
    return "border-blue-300/80 bg-blue-500 text-white";
  }

  return "border-white/30 bg-slate-950/60 text-transparent";
}

function stepLabelClasses(status: WorkflowStepStatus): string {
  if (status === "complete") {
    return "text-white";
  }

  if (status === "active") {
    return "text-blue-100";
  }

  return "text-slate-300";
}

function statusBadge(active: boolean, text: string, activeClasses: string, inactiveClasses: string) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide ${active ? activeClasses : inactiveClasses}`}>
      {text}
    </span>
  );
}

function formatUtcClock(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC"
  });
}

export function StreamerRightRail(props: StreamerRightRailProps) {
  const overlayConnected = props.flowState?.overlayConnected ?? props.uiState.overlayConnected;
  const primaryLabel = !props.uiState.joined ? "Join in sponsorships" : props.uiState.isPaused ? "Resume" : "Pause";
  const warmupProgress = Math.min(100, Math.round((props.uiState.liveMinutes / 20) * 100));

  return (
    <aside className="streamer-card order-3 rounded-2xl p-4 xl:order-none" data-testid="streamer-right-rail">
      <button
        type="button"
        className="streamer-primary-btn w-full rounded-xl px-4 py-3 text-base font-semibold text-white transition"
        onClick={props.onPrimaryAction}
      >
        {primaryLabel}
      </button>

      <section className="mt-5 border-b border-white/10 pb-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--streamer-muted)]">Workflow</p>
        <ul className="mt-3 space-y-5 border-l border-white/15 pl-6">
          {props.workflowSteps.map((step) => (
            <li key={step.id} className="relative" data-testid={`workflow-step-${step.id}`} data-status={step.status}>
              <span
                className={`absolute -left-[33px] top-[2px] inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-semibold ${stepDotClasses(step.status)}`}
                aria-hidden="true"
              >
                {step.status === "complete" ? "v" : "o"}
              </span>
              <p className={`text-xl font-semibold leading-tight ${stepLabelClasses(step.status)}`}>{step.label}</p>
              {step.description ? <p className="mt-1 text-sm leading-relaxed text-slate-400">{step.description}</p> : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="streamer-card-soft mt-5 rounded-xl p-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--streamer-muted)]">Status</h3>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2">
            <span className="text-sm text-slate-300">Campaign</span>
            {statusBadge(true, "available", "bg-sky-500/20 text-sky-200", "bg-slate-700/40 text-slate-300")}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2">
            <span className="text-sm text-slate-300">Overlay</span>
            <span
              data-testid="overlay-status-badge"
              className={`rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
                overlayConnected ? "bg-emerald-500/20 text-emerald-200" : "bg-rose-500/20 text-rose-200"
              }`}
            >
              {overlayConnected ? "connected" : "not connected"}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2">
            <span className="text-sm text-slate-300">Overlay service</span>
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
                props.flowState?.overlayServiceEnabled ? "bg-emerald-500/20 text-emerald-200" : "bg-rose-500/20 text-rose-200"
              }`}
            >
              {props.flowState?.overlayServiceEnabled ? "enabled" : "disabled"}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2">
            <span className="text-sm text-slate-300">Placement mode</span>
            <span className="rounded-full bg-slate-700/40 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-200">
              {props.flowState?.overlayPlacementMode ?? "automatic"}
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2">
            <span className="text-sm text-slate-300">Requirements</span>
            <span
              data-testid="requirements-status-badge"
              className={`rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
                props.uiState.requirementsCompleted ? "bg-emerald-500/20 text-emerald-200" : "bg-amber-500/20 text-amber-200"
              }`}
            >
              {props.uiState.requirementsCompleted ? "completed" : "pending"}
            </span>
          </div>

          <div className="rounded-lg border border-white/10 bg-slate-950/55 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Live warmup</span>
              <span className="text-xs font-semibold text-slate-200" data-testid="live-progress-value">
                {props.uiState.liveMinutes}/20m
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-slate-900/70">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 transition-all" style={{ width: `${warmupProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="rounded-lg border border-white/15 bg-slate-900/65 px-2 py-2 text-xs font-medium text-slate-200 transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={props.onToggleOverlay}
            aria-label="Toggle overlay from right rail"
            disabled={!props.uiState.joined}
          >
            Toggle overlay
          </button>
          <button
            type="button"
            className="rounded-lg border border-white/15 bg-slate-900/65 px-2 py-2 text-xs font-medium text-slate-200 transition hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={props.onToggleRequirements}
            aria-label="Toggle requirements from right rail"
            disabled={!props.uiState.joined}
          >
            Toggle requirements
          </button>
        </div>

        <button
          type="button"
          className="mt-2 w-full rounded-lg border border-cyan-300/35 bg-cyan-500/10 px-2 py-2 text-xs font-medium uppercase tracking-wide text-cyan-100 transition hover:border-cyan-300/70 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={props.onSimulateLiveProgress}
          aria-label="Simulate five minutes live"
          disabled={!props.uiState.joined || !overlayConnected || props.uiState.liveMinutes >= 20}
        >
          Simulate +5m live
        </button>
      </section>

      <section className="streamer-card-soft mt-4 rounded-xl p-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--streamer-muted)]">Proof timeline</h3>
        <ul className="mt-3 space-y-2" data-testid="proof-timeline-list">
          {props.activityLog.slice(0, 5).map((entry) => (
            <li key={entry.id} className="rounded-lg border border-white/10 bg-black/25 px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-100">{entry.title}</p>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">{formatUtcClock(entry.ts)} UTC</p>
              </div>
              <p className="mt-1 text-xs text-slate-300">{entry.detail}</p>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
