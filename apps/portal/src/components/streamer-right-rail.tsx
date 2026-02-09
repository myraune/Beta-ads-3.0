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

export function StreamerRightRail(props: StreamerRightRailProps) {
  const primaryLabel = !props.uiState.joined ? "Join" : props.uiState.isPaused ? "Resume" : "Pause";

  return (
    <aside className="streamer-card order-3 rounded-2xl p-4 xl:order-none" data-testid="streamer-right-rail">
      <button
        type="button"
        className="w-full rounded-xl bg-gradient-to-r from-blue-500 via-blue-500 to-cyan-400 px-4 py-3 text-base font-semibold text-white shadow-[0_12px_30px_rgba(59,130,246,0.35)] transition hover:brightness-110"
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
                props.uiState.overlayConnected ? "bg-emerald-500/20 text-emerald-200" : "bg-rose-500/20 text-rose-200"
              }`}
            >
              {props.uiState.overlayConnected ? "connected" : "not connected"}
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
      </section>
    </aside>
  );
}
