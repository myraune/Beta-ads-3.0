import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StreamerWorkspace } from "./streamer-workspace";

describe("StreamerWorkspace", () => {
  it("renders all 5 sections in nav and defaults to General", () => {
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
    render(<StreamerWorkspace />);

    await user.click(screen.getByRole("button", { name: /^Brief/i }));
    expect(screen.getByTestId("streamer-section-brief")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Stream content/i }));
    expect(screen.getByTestId("streamer-section-stream-content")).toBeInTheDocument();
  });

  it("joins campaign and updates workflow step states", async () => {
    const user = userEvent.setup();
    render(<StreamerWorkspace />);

    await user.click(screen.getByRole("button", { name: "Join" }));

    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(screen.getByTestId("workflow-step-join")).toHaveAttribute("data-status", "complete");
    expect(screen.getByTestId("workflow-step-go-live")).toHaveAttribute("data-status", "active");
  });

  it("toggles overlay connected state and updates status", async () => {
    const user = userEvent.setup();
    render(<StreamerWorkspace />);

    await user.click(screen.getByRole("button", { name: "Join" }));
    await user.click(screen.getByRole("button", { name: /^Stream content/i }));
    await user.click(screen.getByRole("button", { name: "Toggle overlay from stream content section" }));

    expect(screen.getByTestId("overlay-status-badge")).toHaveTextContent("connected");
    expect(screen.getByTestId("workflow-step-go-live")).toHaveAttribute("data-status", "complete");
  });

  it("marks requirements complete and updates right rail status", async () => {
    const user = userEvent.setup();
    render(<StreamerWorkspace />);

    await user.click(screen.getByRole("button", { name: "Join" }));
    await user.click(screen.getByRole("button", { name: /^Requirements/i }));
    await user.click(screen.getByRole("button", { name: "Toggle requirements from requirements section" }));

    expect(screen.getByTestId("requirements-status-badge")).toHaveTextContent("completed");
    expect(screen.getByTestId("workflow-step-requirements")).toHaveAttribute("data-status", "complete");
  });

  it("selects overlay slot in configuration", async () => {
    const user = userEvent.setup();
    render(<StreamerWorkspace />);

    await user.click(screen.getByRole("button", { name: /^Configuration/i }));
    await user.click(screen.getByTestId("overlay-slot-2"));

    expect(screen.getByTestId("selected-overlay-slot")).toHaveTextContent("Top center");
  });

  it("keeps desktop grid and stacked fallback classes", () => {
    render(<StreamerWorkspace />);

    const grid = screen.getByTestId("streamer-grid");
    const rightRail = screen.getByTestId("streamer-right-rail");

    expect(grid.className).toContain("xl:grid-cols-[220px_minmax(0,1fr)_300px]");
    expect(rightRail.className).toContain("order-3");
    expect(rightRail.className).toContain("xl:order-none");
  });
});
