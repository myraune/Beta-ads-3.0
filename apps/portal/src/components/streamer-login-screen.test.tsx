import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StreamerLoginScreen } from "./streamer-login-screen";
import { STREAMER_FLOW_STORAGE_KEY } from "@/lib/streamer-flow-store";

describe("StreamerLoginScreen", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders Twitch login and disabled YouTube and Kick buttons", () => {
    render(<StreamerLoginScreen />);

    expect(screen.getByAltText("Beta Ads logo")).toBeInTheDocument();
    expect(screen.getByAltText("Beta Ads mark")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login with Twitch" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Login with YouTube" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Login with Kick" })).toBeDisabled();
  });

  it("updates flow state and calls onConnected after Twitch login", async () => {
    const user = userEvent.setup();
    const onConnected = vi.fn();
    render(<StreamerLoginScreen onConnected={onConnected} />);

    await user.click(screen.getByRole("button", { name: "Login with Twitch" }));

    expect(onConnected).toHaveBeenCalledTimes(1);
    const raw = window.localStorage.getItem(STREAMER_FLOW_STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(raw).toContain('"providerConnected":true');
    expect(raw).toContain('"connectedProvider":"twitch"');
  });
});
