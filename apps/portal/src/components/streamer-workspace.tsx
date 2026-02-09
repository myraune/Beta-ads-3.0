"use client";

import { useMemo, useState } from "react";
import { DEFAULT_STREAMER_WORKSPACE_DATA } from "@/lib/streamer-mock";
import { StreamerLeftNav } from "@/components/streamer-left-nav";
import { StreamerRightRail } from "@/components/streamer-right-rail";
import { StreamerSections } from "@/components/streamer-sections";
import type { StreamerUiState, StreamerWorkspaceProps, WorkflowStep } from "@/types/streamer";

function buildWorkflowSteps(state: StreamerUiState): WorkflowStep[] {
  const reviewReady = state.joined && state.overlayConnected && state.requirementsCompleted;
  const reviewDone = reviewReady && state.isPaused;

  return [
    {
      id: "join",
      label: "Join campaign",
      status: state.joined ? "complete" : "pending"
    },
    {
      id: "go-live",
      label: "Go live",
      description: "Campaign activates after 20 minutes of stable overlay heartbeat",
      status: state.overlayConnected ? "complete" : state.joined ? "active" : "pending"
    },
    {
      id: "requirements",
      label: "Complete requirements",
      status: state.requirementsCompleted ? "complete" : state.joined ? "active" : "pending"
    },
    {
      id: "review",
      label: "Wait for review",
      status: reviewDone ? "complete" : reviewReady ? "active" : "pending"
    },
    {
      id: "paid",
      label: "Get paid",
      status: reviewDone ? "active" : "pending"
    }
  ];
}

const DEFAULT_UI_STATE: StreamerUiState = {
  joined: false,
  overlayConnected: false,
  requirementsCompleted: false,
  activeSection: "general",
  selectedOverlaySlot: 4,
  isPaused: false
};

export function StreamerWorkspace(props: StreamerWorkspaceProps) {
  const data = props.data ?? DEFAULT_STREAMER_WORKSPACE_DATA;
  const [uiState, setUiState] = useState<StreamerUiState>(DEFAULT_UI_STATE);

  const workflowSteps = useMemo(() => buildWorkflowSteps(uiState), [uiState]);

  const onPrimaryAction = () => {
    setUiState((previous) => {
      if (!previous.joined) {
        return {
          ...previous,
          joined: true,
          isPaused: false
        };
      }

      return {
        ...previous,
        isPaused: !previous.isPaused
      };
    });
  };

  const onToggleOverlay = () => {
    setUiState((previous) => {
      if (!previous.joined) {
        return previous;
      }

      return {
        ...previous,
        overlayConnected: !previous.overlayConnected
      };
    });
  };

  const onToggleRequirements = () => {
    setUiState((previous) => {
      if (!previous.joined) {
        return previous;
      }

      return {
        ...previous,
        requirementsCompleted: !previous.requirementsCompleted
      };
    });
  };

  return (
    <main className="streamer-theme min-h-screen px-3 py-3 md:px-4 xl:px-6">
      <div className="streamer-frame mx-auto max-w-[1700px] rounded-3xl border border-white/10 p-3 md:p-4">
        <header className="mb-4 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--streamer-muted)]">Streamer workspace</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Live campaign operations</h2>
              <p className="mt-1 text-sm text-slate-300">Modern demo mode, local state only, no backend writes.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm sm:min-w-[260px]">
              <div className="streamer-pill rounded-xl px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--streamer-muted)]">Time</p>
                <p className="mt-1 font-semibold text-white">UTC</p>
              </div>
              <div className="streamer-pill rounded-xl px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--streamer-muted)]">Impression rule</p>
                <p className="mt-1 font-semibold text-white">ad_completed</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_300px]" data-testid="streamer-grid">
          <StreamerLeftNav
            campaignId={data.campaignId}
            campaignTitle={data.campaignTitle}
            activeSection={uiState.activeSection}
            onSelect={(section) => setUiState((previous) => ({ ...previous, activeSection: section }))}
          />

          <section className="order-2 space-y-4 xl:order-none" data-testid="streamer-main-column">
            <StreamerSections
              data={data}
              uiState={uiState}
              onToggleOverlay={onToggleOverlay}
              onToggleRequirements={onToggleRequirements}
              onSelectOverlaySlot={(slotId) => setUiState((previous) => ({ ...previous, selectedOverlaySlot: slotId }))}
            />
          </section>

          <StreamerRightRail
            uiState={uiState}
            workflowSteps={workflowSteps}
            onPrimaryAction={onPrimaryAction}
            onToggleOverlay={onToggleOverlay}
            onToggleRequirements={onToggleRequirements}
          />
        </div>
      </div>
    </main>
  );
}
