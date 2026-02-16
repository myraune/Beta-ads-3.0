import type { RoleTheme } from "@/lib/theme-tokens";

export interface PlatformNavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  description?: string;
  badge?: string;
}

export const STREAMER_SHELL_ITEMS: PlatformNavItem[] = [
  { id: "sponsorships", label: "Sponsorships", href: "/streamer", icon: "SP", description: "Join and manage live deals" },
  { id: "clips", label: "My clips", href: "/streamer/clips", icon: "CL", description: "Submit and review campaign clips" },
  { id: "wallet", label: "Wallet", href: "/streamer/wallet", icon: "WL", description: "Payout history and earnings" },
  { id: "statistics", label: "Statistics", href: "/streamer/statistics", icon: "ST", description: "Delivery, clicks, and CTR" },
  { id: "help", label: "Help", href: "/streamer/help", icon: "HP", description: "FAQ and support tickets" },
  { id: "settings", label: "Settings", href: "/streamer/settings", icon: "SG", description: "Profile and overlay controls" }
];

export const BUSINESS_NAV_ITEMS: PlatformNavItem[] = [
  { id: "overview", label: "Overview", href: "/business", icon: "OV", description: "Portfolio signal and readiness" },
  { id: "marketplace", label: "Streamer explorer", href: "/business/marketplace", icon: "EX", description: "Find and shortlist creators" },
  { id: "campaigns", label: "Campaigns", href: "/business/campaigns", icon: "CP", description: "Launch and track flights", badge: "core" },
  { id: "reports", label: "Reports", href: "/business/reports", icon: "RP", description: "Exports and proof timelines" },
  { id: "billing", label: "Billing", href: "/business/billing", icon: "BL", description: "Budget and invoices" }
];

export const ADMIN_NAV_ITEMS: PlatformNavItem[] = [
  { id: "overview", label: "Overview", href: "/admin", icon: "OV", description: "Ops command center" },
  { id: "campaigns", label: "Campaign review", href: "/admin/campaigns", icon: "CR", description: "Approval and moderation queue" },
  { id: "streamers", label: "Streamer quality", href: "/admin/streamers", icon: "SQ", description: "Risk and quality flags" },
  { id: "events", label: "Events", href: "/admin/events", icon: "EV", description: "Append-only audit trail", badge: "log" },
  { id: "payouts", label: "Payouts", href: "/admin/payouts", icon: "PO", description: "Settlement operations" },
  { id: "system", label: "System health", href: "/admin/system", icon: "SY", description: "Ingestion and queue health" }
];

export function isActiveNavItem(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === href;
  }

  if (pathname === href) {
    return true;
  }

  return pathname.startsWith(`${href}/`);
}

export function navForRole(role: RoleTheme): PlatformNavItem[] {
  if (role === "streamer") {
    return STREAMER_SHELL_ITEMS;
  }

  if (role === "business") {
    return BUSINESS_NAV_ITEMS;
  }

  return ADMIN_NAV_ITEMS;
}
