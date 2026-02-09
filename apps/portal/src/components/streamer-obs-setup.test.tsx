import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StreamerObsSetup } from "./streamer-obs-setup";
import { STREAMER_FLOW_STORAGE_KEY } from "@/lib/streamer-flow-store";
import type { StreamerFlowState } from "@/types/streamer";

const CONNECTED_FLOW_STATE: StreamerFlowState = {
  providerConnected: true,
  connectedProvider: "twitch",
  setupCompleted: false,
  overlayConnected: false,
  joinedCampaignIds: [],
  selectedCampaignId: null,
  lastTestRunAt: null
};

describe("StreamerObsSetup", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("cycles test animation status and marks setup complete when visible", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(STREAMER_FLOW_STORAGE_KEY, JSON.stringify(CONNECTED_FLOW_STATE));
    render(<StreamerObsSetup />);

    await user.click(screen.getByRole("button", { name: "Run test animation" }));
    expect(screen.getByTestId("obs-test-status")).toHaveTextContent("running");

    await user.click(screen.getByRole("button", { name: "Run test animation" }));
    expect(screen.getByTestId("obs-test-status")).toHaveTextContent("visible");
    expect(screen.getByTestId("obs-connection-status")).toHaveTextContent("active");

    const stored = window.localStorage.getItem(STREAMER_FLOW_STORAGE_KEY);
    expect(stored).toContain('"setupCompleted":true');
    expect(stored).toContain('"overlayConnected":true');
  });

  it("switches setup guide tabs", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(STREAMER_FLOW_STORAGE_KEY, JSON.stringify(CONNECTED_FLOW_STATE));
    render(<StreamerObsSetup />);

    await user.click(screen.getByTestId("setup-tab-text"));
    expect(screen.getByRole("heading", { name: "Manual browser source setup" })).toBeInTheDocument();

    await user.click(screen.getByTestId("setup-tab-mobile"));
    expect(screen.getByRole("heading", { name: "Mobile streaming setup" })).toBeInTheDocument();
  });
});
