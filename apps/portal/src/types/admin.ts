export type IncidentSeverity = "low" | "medium" | "high";

export interface AdminKpi {
  label: string;
  value: string;
  detail: string;
}

export interface AdminIncident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  service: string;
  openedAt: string;
  status: "open" | "monitoring" | "resolved";
}

export interface AdminCampaignReview {
  id: string;
  campaignName: string;
  advertiser: string;
  submittedAt: string;
  status: "submitted" | "approved" | "rejected";
  riskFlags: string[];
}

export interface AdminStreamerRisk {
  streamerId: string;
  handle: string;
  score: number;
  flags: string[];
  lastUpdated: string;
}

export interface AdminAuditEvent {
  id: string;
  action: string;
  entityType: string;
  actor: string;
  createdAt: string;
  detail: string;
}

export interface AdminPayout {
  id: string;
  campaignName: string;
  streamerHandle: string;
  amount: number;
  currency: string;
  status: "queued" | "processing" | "paid";
  requestedAt: string;
}

export interface AdminSystemMetric {
  id: string;
  label: string;
  current: string;
  target: string;
  status: "healthy" | "warning" | "critical";
}
