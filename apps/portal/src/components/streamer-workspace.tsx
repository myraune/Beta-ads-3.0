"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_STREAMER_WORKSPACE_DATA, getWorkspaceCampaignById } from "@/lib/streamer-mock";
import { useStreamerFlowState } from "@/lib/streamer-flow-store";
import { StreamerLeftNav } from "@/components/streamer-left-nav";
import { StreamerRightRail } from "@/components/streamer-right-rail";
import { StreamerSections } from "@/components/streamer-sections";
import type { ProofTimelineEvent, StreamerUiState, StreamerWorkspaceProps, WorkflowStep } from "@/types/streamer";

function buildWorkflowSteps(state: StreamerUiState): WorkflowStep[] {
  const hasLiveWarmup = state.overlayConnected && state.liveMinutes >= 20;
  const reviewReady = state.joined && hasLiveWarmup && state.requirementsCompleted;
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
      description: `Campaign activates after 20 minutes of stable overlay heartbeat (${state.liveMinutes}/20 min)`,
      status: hasLiveWarmup ? "complete" : state.joined ? "active" : "pending"
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

function generateTrackedChatLink(destinationUrl: string, campaignId: string): string {
  const destination = new URL(destinationUrl);
  const uniqueRef =
    typeof window !== "undefined" && "crypto" in window && typeof window.crypto.randomUUID === "function"
      ? window.crypto.randomUUID().slice(0, 8)
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

  destination.searchParams.set("utm_source", "twitch_chat");
  destination.searchParams.set("utm_medium", "streamer_cta");
  destination.searchParams.set("utm_campaign", campaignId);
  destination.searchParams.set("beta_ref", uniqueRef);

  return destination.toString();
}

const DEFAULT_UI_STATE: StreamerUiState = {
  joined: false,
  overlayConnected: false,
  requirementsCompleted: false,
  completedRequirementIds: [],
  liveMinutes: 0,
  activeSection: "general",
  selectedOverlaySlot: 4,
  generatedChatLink: null,
  isPaused: false
};

export function StreamerWorkspace(props: StreamerWorkspaceProps) {
  const { state: flowState, setState: setFlowState } = useStreamerFlowState();
  const [routeCampaignId, setRouteCampaignId] = useState<string | null>(props.campaignId ?? null);

  useEffect(() => {
    if (props.campaignId) {
      setRouteCampaignId(props.campaignId);
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const fromQuery = new URLSearchParams(window.location.search).get("campaign");
    if (fromQuery) {
      setRouteCampaignId(fromQuery);
    }
  }, [props.campaignId]);

  const data = useMemo(
    () => props.data ?? getWorkspaceCampaignById(routeCampaignId ?? flowState.selectedCampaignId),
    [flowState.selectedCampaignId, props.data, routeCampaignId]
  );
  const campaignJoined = flowState.joinedCampaignIds.includes(data.campaignId);
  const setupCompleted = !data.requiresSetup || flowState.setupCompleted;

  const [uiState, setUiState] = useState<StreamerUiState>({
    ...DEFAULT_UI_STATE,
    joined: campaignJoined,
    overlayConnected: flowState.overlayConnected
  });
  const [activityLog, setActivityLog] = useState<ProofTimelineEvent[]>([
    {
      id: "boot",
      ts: new Date().toISOString(),
      title: "Workspace initialized",
      detail: "Frontend demo mode active, no backend writes."
    }
  ]);

  const requirementIds = useMemo(() => data.requirements.items.map((item) => item.id), [data.requirements.items]);

  const workflowSteps = useMemo(() => buildWorkflowSteps(uiState), [uiState]);

  useEffect(() => {
    setUiState((previous) => ({
      ...previous,
      joined: campaignJoined,
      overlayConnected: flowState.overlayConnected
    }));
  }, [campaignJoined, flowState.overlayConnected]);

  useEffect(() => {
    if (flowState.selectedCampaignId === data.campaignId) {
      return;
    }

    setFlowState((previous) => ({
      ...previous,
      selectedCampaignId: data.campaignId
    }));
  }, [data.campaignId, flowState.selectedCampaignId, setFlowState]);

  const pushActivity = (title: string, detail: string) => {
    setActivityLog((previous) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        ts: new Date().toISOString(),
        title,
        detail
      },
      ...previous
    ].slice(0, 12));
  };

  const onPrimaryAction = () => {
    if (!campaignJoined) {
      return;
    }

    const nextPaused = !uiState.isPaused;
    setUiState((previous) => ({
      ...previous,
      isPaused: nextPaused
    }));
    pushActivity(nextPaused ? "Campaign paused" : "Campaign resumed", nextPaused ? "Review stage can finalize." : "Live operations resumed.");
  };

  const onToggleOverlay = () => {
    if (!campaignJoined || !setupCompleted) {
      return;
    }

    const nextOverlayConnected = !uiState.overlayConnected;
    setUiState((previous) => ({
      ...previous,
      overlayConnected: nextOverlayConnected,
      liveMinutes: nextOverlayConnected ? previous.liveMinutes : 0
    }));
    setFlowState((previous) => ({
      ...previous,
      overlayConnected: nextOverlayConnected
    }));
    pushActivity(
      nextOverlayConnected ? "Overlay connected" : "Overlay disconnected",
      nextOverlayConnected ? "Heartbeat stream resumed." : "Warmup timer reset."
    );
  };

  const onToggleRequirements = () => {
    if (!campaignJoined) {
      return;
    }

    const nextCompleted = !uiState.requirementsCompleted;
    setUiState((previous) => ({
      ...previous,
      requirementsCompleted: nextCompleted,
      completedRequirementIds: nextCompleted ? requirementIds : []
    }));
    pushActivity(
      nextCompleted ? "Requirements completed" : "Requirements marked pending",
      nextCompleted ? "All checklist items were marked complete." : "Checklist was reset for follow-up."
    );
  };

  const onToggleRequirementItem = (itemId: string) => {
    if (!campaignJoined) {
      return;
    }

    setUiState((previous) => {
      const alreadyIncluded = previous.completedRequirementIds.includes(itemId);
      const nextRequirementIds = alreadyIncluded
        ? previous.completedRequirementIds.filter((id) => id !== itemId)
        : [...previous.completedRequirementIds, itemId];
      const nextCompleted = requirementIds.length > 0 && nextRequirementIds.length === requirementIds.length;

      return {
        ...previous,
        completedRequirementIds: nextRequirementIds,
        requirementsCompleted: nextCompleted
      };
    });
    pushActivity("Requirement updated", `Checklist item ${itemId} toggled.`);
  };

  const onSimulateLiveProgress = () => {
    if (!campaignJoined || !uiState.overlayConnected) {
      return;
    }

    const nextMinutes = Math.min(20, uiState.liveMinutes + 5);
    setUiState((previous) => ({
      ...previous,
      liveMinutes: nextMinutes
    }));
    pushActivity("Live warmup updated", `Stable overlay time is now ${nextMinutes} of 20 minutes.`);
  };

  const onGenerateChatLink = (destinationUrl: string) => {
    if (!campaignJoined) {
      return;
    }

    try {
      const generated = generateTrackedChatLink(destinationUrl, data.campaignId);
      setUiState((previous) => ({
        ...previous,
        generatedChatLink: generated
      }));
      pushActivity("Chat CTA link generated", "Tracked link created for chat command usage.");
    } catch {
      pushActivity("Chat CTA link failed", "Destination URL was invalid.");
    }
  };

  if (!campaignJoined) {
    return (
      <main className="streamer-theme min-h-screen px-3 py-3 md:px-4 xl:px-6">
        <div className="streamer-frame mx-auto max-w-[1700px] rounded-3xl border border-white/10 p-4">
          <div className="rounded-2xl border border-amber-300/30 bg-amber-500/10 p-6" data-testid="workspace-join-guard">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Campaign access blocked</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{data.campaignTitle}</h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-amber-100/90">
              Join this sponsorship from the marketplace first, then return to this workspace to manage live delivery and proof timelines.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/streamer"
                className="streamer-primary-btn rounded-xl px-4 py-2 text-sm font-semibold text-white transition"
              >
                Go to sponsorships
              </Link>
              <Link href="/streamer/setup" className="rounded-xl border border-white/25 bg-slate-950/35 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/40">
                Open OBS setup
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="streamer-theme min-h-screen px-3 py-3 md:px-4 xl:px-6">
      <div className="streamer-frame mx-auto max-w-[1700px] rounded-3xl border border-white/10 p-3 md:p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <Link href="/streamer" className="rounded-lg border border-cyan-300/30 bg-slate-950/45 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-cyan-100 transition hover:border-cyan-300/60">
            Back to sponsorships
          </Link>
          <Link href="/streamer/setup" className="rounded-lg border border-emerald-300/35 bg-emerald-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-100 transition hover:border-emerald-300/70">
            OBS setup
          </Link>
        </div>

        {!setupCompleted ? (
          <div className="mb-4 rounded-xl border border-amber-300/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-100" data-testid="workspace-setup-guard">
            Complete OBS setup to unlock overlay testing and stable campaign delivery.
            <Link href="/streamer/setup" className="ml-2 font-semibold underline">
              Open setup
            </Link>
          </div>
        ) : null}

        <header className="mb-4 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="inline-flex rounded-full border border-cyan-300/35 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-100">
                Streamer workspace
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Live campaign operations</h2>
              <p className="mt-1 text-sm text-slate-300">Beta Ads live control mode, local state only, no backend writes.</p>
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
              setupCompleted={setupCompleted}
              onToggleRequirementItem={onToggleRequirementItem}
              onGenerateChatLink={onGenerateChatLink}
              onToggleOverlay={onToggleOverlay}
              onToggleRequirements={onToggleRequirements}
              onSelectOverlaySlot={(slotId) => {
                setUiState((previous) => ({ ...previous, selectedOverlaySlot: slotId }));
                pushActivity("Overlay slot selected", `Primary slot changed to ${slotId}.`);
              }}
            />
          </section>

          <StreamerRightRail
            uiState={uiState}
            flowState={flowState}
            workflowSteps={workflowSteps}
            activityLog={activityLog}
            onPrimaryAction={onPrimaryAction}
            onSimulateLiveProgress={onSimulateLiveProgress}
            onToggleOverlay={onToggleOverlay}
            onToggleRequirements={onToggleRequirements}
          />
        </div>
      </div>
    </main>
  );
}
