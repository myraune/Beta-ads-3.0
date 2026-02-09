import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StreamerSponsorshipHub } from "./streamer-sponsorship-hub";
import { STREAMER_FLOW_STORAGE_KEY } from "@/lib/streamer-flow-store";
import type { StreamerFlowState } from "@/types/streamer";

const CONNECTED_FLOW_STATE: StreamerFlowState = {
  providerConnected: true,
  connectedProvider: "twitch",
  setupCompleted: false,
  overlayConnected: false,
  joinedCampaignIds: [],
  selectedCampaignId: null,
  lastTestRunAt: null,
  overlayPlacementMode: "automatic",
  minimumCooldownMinutes: 35,
  startDelayMinutes: 20,
  overlayServiceEnabled: true,
  darkModeEnabled: true
};

describe("StreamerSponsorshipHub", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows connect warning if provider is not connected", () => {
    render(<StreamerSponsorshipHub />);

    expect(screen.getByText(/Connect Twitch first to join sponsorships/i)).toBeInTheDocument();
  });

  it("switches tabs and moves joined campaign to My sponsorships", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(STREAMER_FLOW_STORAGE_KEY, JSON.stringify(CONNECTED_FLOW_STATE));

    render(<StreamerSponsorshipHub />);

    const firstCard = screen.getByTestId("sponsorship-card-714");
    await user.click(within(firstCard).getByRole("button", { name: "Join" }));

    expect(screen.queryByTestId("sponsorship-card-714")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("sponsorship-tab-my"));
    expect(screen.getByTestId("sponsorship-card-714")).toBeInTheDocument();
    expect(within(screen.getByTestId("sponsorship-card-714")).getByRole("button", { name: "Leave" })).toBeInTheDocument();
  });
});
