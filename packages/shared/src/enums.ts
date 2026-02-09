export const ROLES = ["admin", "agency", "brand", "streamer", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const EVENT_TYPES = [
  "overlay_connected",
  "overlay_heartbeat",
  "overlay_disconnected",
  "session_started",
  "session_ended",
  "ad_candidate_selected",
  "ad_command_sent",
  "ad_rendered",
  "ad_completed",
  "ad_click",
  "ad_error"
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const CAMPAIGN_STATUSES = ["draft", "submitted", "approved", "rejected", "active", "paused", "completed"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const CREATIVE_FORMATS = ["image", "gif", "mp4"] as const;
export type CreativeFormat = (typeof CREATIVE_FORMATS)[number];

export const APPROVAL_STATUSES = ["draft", "submitted", "approved", "rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const PAYOUT_STATUSES = ["pending", "paid"] as const;
export type PayoutStatus = (typeof PAYOUT_STATUSES)[number];
