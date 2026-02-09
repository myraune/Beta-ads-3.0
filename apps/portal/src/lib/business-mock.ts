import type {
  BusinessCampaign,
  BusinessInvoice,
  BusinessKpi,
  BusinessReportRow,
  BusinessStreamerProfile,
  CampaignWizardState
} from "@/types/business";

export const BUSINESS_KPIS: BusinessKpi[] = [
  { label: "Active campaigns", value: "6", delta: "+2 this week", tone: "good" },
  { label: "Delivered impressions", value: "182,440", delta: "+14.2%", tone: "good" },
  { label: "CTR", value: "2.74%", delta: "-0.3%", tone: "warning" },
  { label: "Spend", value: "$42,800", delta: "72% of budget", tone: "neutral" }
];

export const BUSINESS_CAMPAIGNS: BusinessCampaign[] = [
  {
    id: "cmp_714",
    slug: "pulse-nvx",
    name: "Project Pulse NVX",
    advertiser: "Nimbus Hardware",
    objective: "Drive traffic to launch page",
    status: "live",
    budget: 24000,
    spent: 16200,
    currency: "USD",
    startDate: "2026-02-10",
    endDate: "2026-03-08",
    assignedStreamers: 24,
    impressions: 83440,
    clicks: 2281,
    ctr: 2.73
  },
  {
    id: "cmp_728",
    slug: "arcwire-latency",
    name: "Arcwire Route Sync",
    advertiser: "Arcwire Networks",
    objective: "Awareness during ranked sessions",
    status: "approved",
    budget: 18000,
    spent: 11200,
    currency: "USD",
    startDate: "2026-02-14",
    endDate: "2026-03-14",
    assignedStreamers: 18,
    impressions: 61422,
    clicks: 1671,
    ctr: 2.72
  },
  {
    id: "cmp_739",
    slug: "ionframe-dualpc",
    name: "IonFrame Capture Buildout",
    advertiser: "IonFrame",
    objective: "Educate on dual PC setup",
    status: "submitted",
    budget: 12000,
    spent: 0,
    currency: "USD",
    startDate: "2026-03-01",
    endDate: "2026-03-28",
    assignedStreamers: 12,
    impressions: 0,
    clicks: 0,
    ctr: 0
  },
  {
    id: "cmp_740",
    slug: "spectra-audio",
    name: "Spectra Audio Arena",
    advertiser: "Spectra Audio",
    objective: "Conversion to product page",
    status: "draft",
    budget: 9000,
    spent: 0,
    currency: "USD",
    startDate: "2026-03-15",
    endDate: "2026-04-12",
    assignedStreamers: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0
  }
];

export const BUSINESS_STREAMERS: BusinessStreamerProfile[] = [
  {
    id: "str_001",
    handle: "myten_tv",
    country: "Norway",
    language: "Norwegian",
    categories: ["FPS", "Tech"],
    avgViewers: 154,
    pricingTier: "Tier B",
    score: 92,
    verified: true
  },
  {
    id: "str_002",
    handle: "pixelrune",
    country: "Sweden",
    language: "English",
    categories: ["RPG", "Action"],
    avgViewers: 88,
    pricingTier: "Tier C",
    score: 84,
    verified: true
  },
  {
    id: "str_003",
    handle: "fragsentinel",
    country: "Denmark",
    language: "English",
    categories: ["FPS", "Esports"],
    avgViewers: 322,
    pricingTier: "Tier A",
    score: 95,
    verified: true
  },
  {
    id: "str_004",
    handle: "lumenbyte",
    country: "Finland",
    language: "English",
    categories: ["Tech", "Variety"],
    avgViewers: 64,
    pricingTier: "Tier C",
    score: 78,
    verified: false
  },
  {
    id: "str_005",
    handle: "northgrid",
    country: "Norway",
    language: "English",
    categories: ["Strategy", "Tech"],
    avgViewers: 211,
    pricingTier: "Tier B",
    score: 89,
    verified: true
  }
];

export const BUSINESS_REPORT_ROWS: BusinessReportRow[] = [
  {
    campaignId: "cmp_714",
    campaignName: "Project Pulse NVX",
    streamerCount: 24,
    impressions: 83440,
    clicks: 2281,
    ctr: 2.73,
    minutesOnScreen: 1280
  },
  {
    campaignId: "cmp_728",
    campaignName: "Arcwire Route Sync",
    streamerCount: 18,
    impressions: 61422,
    clicks: 1671,
    ctr: 2.72,
    minutesOnScreen: 944
  },
  {
    campaignId: "cmp_739",
    campaignName: "IonFrame Capture Buildout",
    streamerCount: 12,
    impressions: 0,
    clicks: 0,
    ctr: 0,
    minutesOnScreen: 0
  }
];

export const BUSINESS_INVOICES: BusinessInvoice[] = [
  {
    id: "inv_2026_01",
    period: "January 2026",
    amount: 15820,
    currency: "USD",
    status: "paid",
    issuedAt: "2026-02-01",
    dueAt: "2026-02-14"
  },
  {
    id: "inv_2026_02",
    period: "February 2026",
    amount: 20410,
    currency: "USD",
    status: "pending",
    issuedAt: "2026-03-01",
    dueAt: "2026-03-14"
  }
];

export const BUSINESS_OBJECTIVES = [
  "Brand awareness",
  "Traffic to landing page",
  "Product conversions",
  "Feature education"
];

export const BUSINESS_FORMATS = ["image", "gif", "mp4", "chat-cta"];

export const BUSINESS_CATEGORIES = ["FPS", "RPG", "Tech", "Strategy", "Variety", "Esports"];

export const BUSINESS_COUNTRIES = ["Norway", "Sweden", "Denmark", "Finland", "Germany", "UK"];

export const BUSINESS_LANGUAGES = ["English", "Norwegian", "Swedish", "Danish"];

export const DEFAULT_CAMPAIGN_WIZARD_STATE: CampaignWizardState = {
  name: "",
  advertiser: "",
  objective: BUSINESS_OBJECTIVES[0],
  budget: "",
  currency: "USD",
  startDate: "",
  endDate: "",
  countries: [],
  languages: [],
  categories: [],
  formats: ["image", "mp4"]
};

export function getBusinessCampaignById(idOrSlug: string): BusinessCampaign | undefined {
  return BUSINESS_CAMPAIGNS.find((campaign) => campaign.id === idOrSlug || campaign.slug === idOrSlug);
}

export function getBusinessCampaignStaticParams(): Array<{ id: string }> {
  return BUSINESS_CAMPAIGNS.map((campaign) => ({ id: campaign.id }));
}
