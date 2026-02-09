"use client";

import { useCallback, useMemo, useState } from "react";
import type { SetStateAction } from "react";
import type { ConnectProvider, StreamerFlowState } from "@/types/streamer";

export const STREAMER_FLOW_STORAGE_KEY = "beta_streamer_flow_v1";

const DEFAULT_STREAMER_FLOW_STATE: StreamerFlowState = {
  providerConnected: false,
  connectedProvider: null,
  setupCompleted: false,
  overlayConnected: false,
  joinedCampaignIds: [],
  selectedCampaignId: null,
  lastTestRunAt: null
};

let memoryFallbackState: StreamerFlowState = {
  ...DEFAULT_STREAMER_FLOW_STATE,
  joinedCampaignIds: []
};

function cloneFlowState(state: StreamerFlowState): StreamerFlowState {
  return {
    ...state,
    joinedCampaignIds: [...state.joinedCampaignIds]
  };
}

function isConnectProvider(value: unknown): value is ConnectProvider {
  return value === "twitch" || value === "youtube" || value === "kick";
}

function sanitizeFlowState(candidate: unknown): StreamerFlowState {
  if (!candidate || typeof candidate !== "object") {
    return cloneFlowState(DEFAULT_STREAMER_FLOW_STATE);
  }

  const raw = candidate as Partial<StreamerFlowState>;
  const joinedCampaignIds = Array.isArray(raw.joinedCampaignIds)
    ? raw.joinedCampaignIds.filter((id): id is string => typeof id === "string")
    : [];
  const uniqueJoinedIds = Array.from(new Set(joinedCampaignIds));

  return {
    providerConnected: Boolean(raw.providerConnected),
    connectedProvider: isConnectProvider(raw.connectedProvider) ? raw.connectedProvider : null,
    setupCompleted: Boolean(raw.setupCompleted),
    overlayConnected: Boolean(raw.overlayConnected),
    joinedCampaignIds: uniqueJoinedIds,
    selectedCampaignId: typeof raw.selectedCampaignId === "string" ? raw.selectedCampaignId : null,
    lastTestRunAt: typeof raw.lastTestRunAt === "string" ? raw.lastTestRunAt : null
  };
}

export function getDefaultStreamerFlowState(): StreamerFlowState {
  return cloneFlowState(DEFAULT_STREAMER_FLOW_STATE);
}

export function readStreamerFlowState(): StreamerFlowState {
  if (typeof window === "undefined") {
    return cloneFlowState(memoryFallbackState);
  }

  try {
    const raw = window.localStorage.getItem(STREAMER_FLOW_STORAGE_KEY);
    if (!raw) {
      return cloneFlowState(memoryFallbackState);
    }

    const parsed = JSON.parse(raw);
    const sanitized = sanitizeFlowState(parsed);
    memoryFallbackState = cloneFlowState(sanitized);
    return sanitized;
  } catch {
    return cloneFlowState(memoryFallbackState);
  }
}

export function writeStreamerFlowState(state: StreamerFlowState): void {
  const sanitized = sanitizeFlowState(state);
  memoryFallbackState = cloneFlowState(sanitized);

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STREAMER_FLOW_STORAGE_KEY, JSON.stringify(sanitized));
  } catch {
    // Ignore storage failures and keep memory fallback as source of truth.
  }
}

export function useStreamerFlowState() {
  const [state, setState] = useState<StreamerFlowState>(() => readStreamerFlowState());

  const updateState = useCallback((nextState: SetStateAction<StreamerFlowState>) => {
    setState((previous) => {
      const resolved = typeof nextState === "function" ? (nextState as (prev: StreamerFlowState) => StreamerFlowState)(previous) : nextState;
      const sanitized = sanitizeFlowState(resolved);
      writeStreamerFlowState(sanitized);
      return sanitized;
    });
  }, []);

  const resetState = useCallback(() => {
    const next = getDefaultStreamerFlowState();
    writeStreamerFlowState(next);
    setState(next);
  }, []);

  return useMemo(
    () => ({
      state,
      setState: updateState,
      resetState
    }),
    [resetState, state, updateState]
  );
}
