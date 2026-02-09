import { describe, expect, it } from "vitest";
import { hasPermission, overlayEventSchema } from "../src";

describe("overlayEventSchema", () => {
  it("accepts valid ad_completed events", () => {
    const parsed = overlayEventSchema.parse({
      type: "ad_completed",
      ts: new Date().toISOString(),
      request_id: "req_123456",
      channel_id: "4cd98059-53bf-4731-bc82-4b3f4bef6c34",
      payload: { durationSec: 30 }
    });

    expect(parsed.type).toBe("ad_completed");
  });

  it("rejects payloads larger than 16KB", () => {
    expect(() =>
      overlayEventSchema.parse({
        type: "ad_completed",
        ts: new Date().toISOString(),
        request_id: "req_123456",
        payload: { huge: "x".repeat(17_000) }
      })
    ).toThrow(/16KB/);
  });
});

describe("rbac", () => {
  it("allows agency delivery trigger", () => {
    expect(hasPermission("agency", "deliveries:trigger")).toBe(true);
  });

  it("blocks viewer from admin audit", () => {
    expect(hasPermission("viewer", "admin:audit")).toBe(false);
  });
});
