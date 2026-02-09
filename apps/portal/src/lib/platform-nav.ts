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
  { id: "sponsorships", label: "Sponsorships", href: "/streamer", icon: "SP" },
  { id: "clips", label: "My clips", href: "/streamer/clips", icon: "CL" },
  { id: "wallet", label: "Wallet", href: "/streamer/wallet", icon: "WL" },
  { id: "statistics", label: "Statistics", href: "/streamer/statistics", icon: "ST" },
  { id: "help", label: "Help", href: "/streamer/help", icon: "HP" },
  { id: "settings", label: "Settings", href: "/streamer/settings", icon: "SG" }
];

export const BUSINESS_NAV_ITEMS: PlatformNavItem[] = [
  { id: "overview", label: "Overview", href: "/business", icon: "OV" },
  { id: "marketplace", label: "Streamer explorer", href: "/business/marketplace", icon: "EX" },
  { id: "campaigns", label: "Campaigns", href: "/business/campaigns", icon: "CP" },
  { id: "reports", label: "Reports", href: "/business/reports", icon: "RP" },
  { id: "billing", label: "Billing", href: "/business/billing", icon: "BL" }
];

export const ADMIN_NAV_ITEMS: PlatformNavItem[] = [
  { id: "overview", label: "Overview", href: "/admin", icon: "OV" },
  { id: "campaigns", label: "Campaign review", href: "/admin/campaigns", icon: "CR" },
  { id: "streamers", label: "Streamer quality", href: "/admin/streamers", icon: "SQ" },
  { id: "events", label: "Events", href: "/admin/events", icon: "EV" },
  { id: "payouts", label: "Payouts", href: "/admin/payouts", icon: "PO" },
  { id: "system", label: "System health", href: "/admin/system", icon: "SY" }
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
