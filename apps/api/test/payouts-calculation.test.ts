import { describe, expect, it } from "vitest";
import { calculatePayoutAmount } from "../src/payouts/payouts.service";

describe("calculatePayoutAmount", () => {
  it("calculates CPM payouts using ad_completed impression definition", () => {
    const amount = calculatePayoutAmount("cpm", 15, 2500);
    expect(amount).toBe(37.5);
  });

  it("uses fixed amount when payout model is fixed", () => {
    const amount = calculatePayoutAmount("fixed", 450, 10000);
    expect(amount).toBe(450);
  });
});
