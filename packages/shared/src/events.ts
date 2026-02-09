import { z } from "zod";
import { EVENT_TYPES } from "./enums";

const uuidField = z.string().uuid();

export const overlayEventSchema = z
  .object({
    id: uuidField.optional(),
    type: z.enum(EVENT_TYPES),
    ts: z.coerce.date(),
    request_id: z.string().min(6).max(128),
    streamer_id: uuidField.nullable().optional(),
    channel_id: uuidField.nullable().optional(),
    session_id: uuidField.nullable().optional(),
    campaign_id: uuidField.nullable().optional(),
    creative_id: uuidField.nullable().optional(),
    payload: z.record(z.any()).default({})
  })
  .superRefine((value, ctx) => {
    const payloadBytes = Buffer.byteLength(JSON.stringify(value.payload), "utf8");
    if (payloadBytes > 16_384) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["payload"],
        message: "payload exceeds 16KB"
      });
    }
  });

export type OverlayEventInput = z.infer<typeof overlayEventSchema>;

export const overlayCommandSchema = z.object({
  commandId: z.string().uuid(),
  campaignId: z.string().uuid(),
  creativeId: z.string().uuid(),
  durationSec: z.number().int().positive().max(120),
  assetUrl: z.string().url(),
  clickUrl: z.string().url().optional(),
  animation: z.enum(["fade", "slide", "pulse"]).default("fade")
});

export type OverlayCommand = z.infer<typeof overlayCommandSchema>;
