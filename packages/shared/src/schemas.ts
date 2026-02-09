import { z } from "zod";
import { CAMPAIGN_STATUSES, CREATIVE_FORMATS } from "./enums";

export const requestMagicLinkSchema = z.object({
  email: z.string().email()
});

export const verifyMagicLinkSchema = z.object({
  email: z.string().email(),
  token: z.string().min(20).max(256)
});

export const streamerProfileSchema = z.object({
  displayName: z.string().min(2).max(80),
  twitchHandle: z.string().min(2).max(80),
  country: z.string().min(2).max(2),
  language: z.string().min(2).max(8),
  categories: z.array(z.string().min(2).max(40)).max(10),
  avgViewers: z.number().int().min(0).max(1_000_000),
  pricingTier: z.string().min(1).max(40)
});

export const channelSchema = z.object({
  twitchChannelName: z.string().min(2).max(120),
  country: z.string().min(2).max(2),
  language: z.string().min(2).max(8),
  categories: z.array(z.string().min(2).max(40)).max(10),
  avgViewers: z.number().int().min(0).max(1_000_000),
  pricingTier: z.string().min(1).max(40)
});

export const campaignCreateSchema = z.object({
  name: z.string().min(2).max(120),
  advertiser: z.string().min(2).max(120),
  objective: z.string().min(2).max(256),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  budget: z.number().positive(),
  currency: z.string().length(3),
  targeting: z.record(z.any()).default({}),
  status: z.enum(CAMPAIGN_STATUSES).default("draft")
});

export const flightCreateSchema = z.object({
  pacingPerHour: z.number().int().min(1).max(1_000),
  capPerStreamerPerHour: z.number().int().min(1).max(200),
  capPerSession: z.number().int().min(1).max(200),
  allowedFormats: z.array(z.enum(CREATIVE_FORMATS)).min(1)
});

export const assignStreamerSchema = z.object({
  streamerChannelIds: z.array(z.string().uuid()).min(1),
  cpmRate: z.number().positive().optional(),
  fixedFee: z.number().positive().optional()
});

export const deliveryTriggerSchema = z.object({
  channelId: z.string().uuid(),
  campaignId: z.string().uuid().optional(),
  creativeId: z.string().uuid().optional(),
  durationSec: z.number().int().positive().max(120).default(15)
});
