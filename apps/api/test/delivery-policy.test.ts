import { describe, expect, it } from "vitest";
import { evaluateDeliveryCaps } from "../src/deliveries/delivery-policy";

describe("evaluateDeliveryCaps", () => {
  it("allows delivery when all caps are under threshold", () => {
    const result = evaluateDeliveryCaps({
      hourlyDelivered: 2,
      sessionDelivered: 3,
      campaignHourlyCommands: 10,
      capPerStreamerPerHour: 6,
      capPerSession: 30,
      pacingPerHour: 20
    });

    expect(result).toEqual({ allowed: true });
  });

  it("blocks delivery when streamer hourly cap is reached", () => {
    const result = evaluateDeliveryCaps({
      hourlyDelivered: 6,
      sessionDelivered: 1,
      campaignHourlyCommands: 1,
      capPerStreamerPerHour: 6,
      capPerSession: 30,
      pacingPerHour: 20
    });

    expect(result).toEqual({ allowed: false, reason: "streamer_hourly_cap_reached" });
  });
});
