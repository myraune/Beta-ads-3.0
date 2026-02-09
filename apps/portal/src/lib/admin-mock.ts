import type {
  AdminAuditEvent,
  AdminCampaignReview,
  AdminIncident,
  AdminKpi,
  AdminPayout,
  AdminStreamerRisk,
  AdminSystemMetric
} from "@/types/admin";

export const ADMIN_KPIS: AdminKpi[] = [
  { label: "Open incidents", value: "3", detail: "2 warning, 1 high" },
  { label: "Pending campaign reviews", value: "7", detail: "Across 4 advertisers" },
  { label: "Queued payouts", value: "19", detail: "$12,420 total" },
  { label: "Event ingest p95", value: "142 ms", detail: "Target < 180 ms" }
];

export const ADMIN_INCIDENTS: AdminIncident[] = [
  {
    id: "inc_102",
    title: "Overlay heartbeat delay in EU cluster",
    severity: "high",
    service: "overlay-gateway",
    openedAt: "2026-02-09T09:11:00Z",
    status: "monitoring"
  },
  {
    id: "inc_099",
    title: "Redis queue lag spike",
    severity: "medium",
    service: "delivery-worker",
    openedAt: "2026-02-09T07:40:00Z",
    status: "open"
  },
  {
    id: "inc_095",
    title: "CSV export timeout for large reports",
    severity: "low",
    service: "reporting-api",
    openedAt: "2026-02-08T18:05:00Z",
    status: "resolved"
  }
];

export const ADMIN_CAMPAIGN_REVIEW_QUEUE: AdminCampaignReview[] = [
  {
    id: "cmp_739",
    campaignName: "IonFrame Capture Buildout",
    advertiser: "IonFrame",
    submittedAt: "2026-02-09T05:33:00Z",
    status: "submitted",
    riskFlags: ["Missing fallback creative"]
  },
  {
    id: "cmp_742",
    campaignName: "Northforge Creator Tools",
    advertiser: "Northforge",
    submittedAt: "2026-02-09T06:12:00Z",
    status: "submitted",
    riskFlags: ["Budget mismatch", "Unverified click URL"]
  },
  {
    id: "cmp_744",
    campaignName: "Circuit Mesh Pro",
    advertiser: "Circuit",
    submittedAt: "2026-02-09T08:02:00Z",
    status: "approved",
    riskFlags: []
  }
];

export const ADMIN_STREAMER_RISKS: AdminStreamerRisk[] = [
  {
    streamerId: "str_001",
    handle: "myten_tv",
    score: 92,
    flags: ["None"],
    lastUpdated: "2026-02-09T09:30:00Z"
  },
  {
    streamerId: "str_011",
    handle: "nightfragx",
    score: 63,
    flags: ["Overlay disconnect spikes", "Low requirement completion"],
    lastUpdated: "2026-02-09T08:44:00Z"
  },
  {
    streamerId: "str_014",
    handle: "silentbyte",
    score: 58,
    flags: ["Repeated ad_error payload"],
    lastUpdated: "2026-02-09T07:51:00Z"
  }
];

export const ADMIN_AUDIT_EVENTS: AdminAuditEvent[] = [
  {
    id: "aud_301",
    action: "payout_mark_paid",
    entityType: "payout",
    actor: "admin@betaads.local",
    createdAt: "2026-02-09T09:18:00Z",
    detail: "Payout pay_144 marked as paid."
  },
  {
    id: "aud_300",
    action: "campaign_approved",
    entityType: "campaign",
    actor: "ops@betaads.local",
    createdAt: "2026-02-09T09:02:00Z",
    detail: "Campaign cmp_744 approved for launch."
  },
  {
    id: "aud_299",
    action: "overlay_key_rotated",
    entityType: "channel",
    actor: "system",
    createdAt: "2026-02-09T08:54:00Z",
    detail: "Overlay key rotated for streamer channel str_011."
  }
];

export const ADMIN_PAYOUTS: AdminPayout[] = [
  {
    id: "pay_144",
    campaignName: "Project Pulse NVX",
    streamerHandle: "myten_tv",
    amount: 482,
    currency: "USD",
    status: "queued",
    requestedAt: "2026-02-09T06:40:00Z"
  },
  {
    id: "pay_145",
    campaignName: "Arcwire Route Sync",
    streamerHandle: "northgrid",
    amount: 390,
    currency: "USD",
    status: "processing",
    requestedAt: "2026-02-09T07:15:00Z"
  },
  {
    id: "pay_146",
    campaignName: "VoidBox Q4 Creator Drive",
    streamerHandle: "pixelrune",
    amount: 244,
    currency: "USD",
    status: "paid",
    requestedAt: "2026-02-08T18:20:00Z"
  }
];

export const ADMIN_SYSTEM_METRICS: AdminSystemMetric[] = [
  { id: "m1", label: "Event ingest latency p95", current: "142 ms", target: "< 180 ms", status: "healthy" },
  { id: "m2", label: "Overlay heartbeat gap rate", current: "3.8%", target: "< 2.5%", status: "warning" },
  { id: "m3", label: "Redis queue depth", current: "1,248", target: "< 1,000", status: "warning" },
  { id: "m4", label: "Worker error rate", current: "0.7%", target: "< 1.0%", status: "healthy" }
];
