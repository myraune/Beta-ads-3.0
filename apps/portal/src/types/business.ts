export type BusinessCampaignStatus = "draft" | "submitted" | "approved" | "live" | "completed" | "rejected";

export interface BusinessKpi {
  label: string;
  value: string;
  delta: string;
  tone: "neutral" | "good" | "warning";
}

export interface BusinessCampaign {
  id: string;
  slug: string;
  name: string;
  advertiser: string;
  objective: string;
  status: BusinessCampaignStatus;
  budget: number;
  spent: number;
  currency: string;
  startDate: string;
  endDate: string;
  assignedStreamers: number;
  impressions: number;
  clicks: number;
  ctr: number;
}

export interface BusinessStreamerProfile {
  id: string;
  handle: string;
  country: string;
  language: string;
  categories: string[];
  avgViewers: number;
  pricingTier: string;
  score: number;
  verified: boolean;
}

export interface BusinessReportRow {
  campaignId: string;
  campaignName: string;
  streamerCount: number;
  impressions: number;
  clicks: number;
  ctr: number;
  minutesOnScreen: number;
}

export interface BusinessInvoice {
  id: string;
  period: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue";
  issuedAt: string;
  dueAt: string;
}

export interface CampaignWizardState {
  name: string;
  advertiser: string;
  objective: string;
  budget: string;
  currency: string;
  startDate: string;
  endDate: string;
  countries: string[];
  languages: string[];
  categories: string[];
  formats: string[];
}
