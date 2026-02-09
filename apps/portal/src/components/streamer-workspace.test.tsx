import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StreamerWorkspace } from "./streamer-workspace";
import { STREAMER_FLOW_STORAGE_KEY } from "@/lib/streamer-flow-store";
import type { StreamerFlowState } from "@/types/streamer";

const BASE_FLOW_STATE: StreamerFlowState = {
  providerConnected: true,
  connectedProvider: "twitch",
  setupCompleted: true,
  overlayConnected: false,
  joinedCampaignIds: ["714"],
  selectedCampaignId: "714",
  lastTestRunAt: null
};

function seedFlowState(overrides: Partial<StreamerFlowState> = {}) {
  const joinedCampaignIds = overrides.joinedCampaignIds ?? BASE_FLOW_STATE.joinedCampaignIds;
  const state: StreamerFlowState = {
    ...BASE_FLOW_STATE,
    ...overrides,
    joinedCampaignIds
  };

  window.localStorage.setItem(STREAMER_FLOW_STORAGE_KEY, JSON.stringify(state));
}

describe("StreamerWorkspace", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows guard banner when campaign is not joined", () => {
    render(<StreamerWorkspace />);

    expect(screen.getByTestId("workspace-join-guard")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to sponsorships" })).toBeInTheDocument();
  });

  it("renders all 5 sections in nav and defaults to General", () => {
    seedFlowState();
    render(<StreamerWorkspace />);

    expect(screen.getByRole("button", { name: /^General/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Brief/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Requirements/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Stream content/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Configuration/i })).toBeInTheDocument();
    expect(screen.getByTestId("streamer-section-general")).toBeInTheDocument();
  });

  it("switches content sections when nav is clicked", async () => {
    const user = userEvent.setup();
    seedFlowState();
    render(<StreamerWorkspace />);

    await user.click(screen.getByRole("button", { name: /^Brief/i }));
    expect(screen.getByTestId("streamer-section-brief")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Stream content/i }));
    expect(screen.getByTestId("streamer-section-stream-content")).toBeInTheDocument();
  });

  it("starts in pause mode for joined campaigns and updates workflow step states", async () => {
    const user = userEvent.setup();
    seedFlowState();
    render(<StreamerWorkspace />);

    await user.click(screen.getByRole("button", { name: "Pause" }));

    expect(screen.getByRole("button", { name: "Resume" })).toBeInTheDocument();
    expect(screen.getByTestId("workflow-step-join")).toHaveAttribute("data-status", "complete");
    expect(screen.getByTestId("workflow-step-go-live")).toHaveAttribute("data-status", "active");
  });

  it("toggles overlay connected state and completes go-live after warmup", async () => {
    const user = userEvent.setup();
    seedFlowState();
    render(<StreamerWorkspace />);

    await user.click(screen.getByRole("button", { name: /^Stream content/i }));
    await user.click(screen.getByRole("button", { name: "Toggle overlay from stream content section" }));
    expect(screen.getByTestId("workflow-step-go-live")).toHaveAttribute("data-status", "active");

    await user.click(screen.getByRole("button", { name: "Simulate five minutes live" }));
    await user.click(screen.getByRole("button", { name: "Simulate five minutes live" }));
    await user.click(screen.getByRole("button", { name: "Simulate five minutes live" }));
    await user.click(screen.getByRole("button", { name: "Simulate five minutes live" }));

    expect(screen.getByTestId("overlay-status-badge")).toHaveTextContent("connected");
    expect(screen.getByTestId("workflow-step-go-live")).toHaveAttribute("data-status", "complete");
    expect(screen.getByTestId("live-progress-value")).toHaveTextContent("20/20m");
  });

  it("marks requirements complete and updates right rail status", async () => {
    const user = userEvent.setup();
    seedFlowState();
    render(<StreamerWorkspace />);

    await user.click(screen.getByRole("button", { name: /^Requirements/i }));
    await user.click(screen.getByRole("button", { name: "Toggle requirements from requirements section" }));

    expect(screen.getByTestId("requirements-status-badge")).toHaveTextContent("completed");
    expect(screen.getByTestId("workflow-step-requirements")).toHaveAttribute("data-status", "complete");
  });

  it("selects overlay slot in configuration", async () => {
    const user = userEvent.setup();
    seedFlowState();
    render(<StreamerWorkspace />);

    await user.click(screen.getByRole("button", { name: /^Configuration/i }));
    await user.click(screen.getByTestId("overlay-slot-2"));

    expect(screen.getByTestId("selected-overlay-slot")).toHaveTextContent("Top center");
  });

  it("keeps desktop grid and stacked fallback classes", () => {
    seedFlowState();
    render(<StreamerWorkspace />);

    const grid = screen.getByTestId("streamer-grid");
    const rightRail = screen.getByTestId("streamer-right-rail");

    expect(grid.className).toContain("xl:grid-cols-[220px_minmax(0,1fr)_300px]");
    expect(rightRail.className).toContain("order-3");
    expect(rightRail.className).toContain("xl:order-none");
  });

  it("shows proof timeline updates and generates a tracked chat link", async () => {
    const user = userEvent.setup();
    seedFlowState();
    render(<StreamerWorkspace />);

    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByTestId("proof-timeline-list")).toHaveTextContent("Campaign paused");

    await user.click(screen.getByRole("button", { name: /^Stream content/i }));
    await user.clear(screen.getByLabelText("Destination URL"));
    await user.type(screen.getByLabelText("Destination URL"), "https://example.com/deals");
    await user.click(screen.getByRole("button", { name: "Generate chat cta link" }));

    const generatedLink = screen.getByTestId("generated-chat-link");
    expect(generatedLink.textContent).toContain("utm_source=twitch_chat");
    expect(generatedLink.textContent).toContain("utm_campaign=714");
  });

  it("shows setup guard when campaign requires setup and setup is not completed", () => {
    seedFlowState({ setupCompleted: false });
    render(<StreamerWorkspace />);

    expect(screen.getByTestId("workspace-setup-guard")).toBeInTheDocument();
  });
});
