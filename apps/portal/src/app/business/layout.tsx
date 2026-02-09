"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { navForRole } from "@/lib/platform-nav";

function businessTopbarMeta(pathname: string): { title: string; subtitle: string; badges: Array<{ label: string; tone?: "neutral" | "info" | "success" | "warning" | "danger" }> } {
  if (pathname.startsWith("/business/marketplace")) {
    return {
      title: "Streamer explorer",
      subtitle: "Discover qualified creators and build shortlist segments.",
      badges: [{ label: "Marketplace" }, { label: "Mock mode", tone: "info" }]
    };
  }

  if (pathname.startsWith("/business/campaigns/new")) {
    return {
      title: "Create campaign",
      subtitle: "Define objectives, targeting, and creative format constraints.",
      badges: [{ label: "Wizard" }, { label: "Draft", tone: "warning" }]
    };
  }

  if (pathname.startsWith("/business/campaigns/")) {
    return {
      title: "Campaign workspace",
      subtitle: "Monitor budget pacing, assignment, and delivery proof.",
      badges: [{ label: "Campaign detail" }, { label: "Live controls", tone: "info" }]
    };
  }

  if (pathname.startsWith("/business/campaigns")) {
    return {
      title: "Campaigns",
      subtitle: "Manage campaign portfolio state and launch readiness.",
      badges: [{ label: "Portfolio" }, { label: "Approval flow", tone: "warning" }]
    };
  }

  if (pathname.startsWith("/business/reports")) {
    return {
      title: "Reports",
      subtitle: "Proof timeline summaries and export controls.",
      badges: [{ label: "Reporting" }, { label: "UTC", tone: "neutral" }]
    };
  }

  if (pathname.startsWith("/business/billing")) {
    return {
      title: "Billing",
      subtitle: "Budget utilization and invoice tracking.",
      badges: [{ label: "Finance" }, { label: "Read only", tone: "info" }]
    };
  }

  return {
    title: "Business command center",
    subtitle: "Operate campaigns, assign streamers, and monitor delivery confidence.",
    badges: [{ label: "Business" }, { label: "MVP", tone: "info" }]
  };
}

export default function BusinessLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const meta = businessTopbarMeta(pathname);

  return (
    <AppShell
      role="business"
      navItems={navForRole("business")}
      activePath={pathname}
      topbar={{
        title: meta.title,
        subtitle: meta.subtitle,
        badges: meta.badges,
        actions: (
          <>
            <Link href="/business/campaigns/new" className="beta-btn-primary">
              New campaign
            </Link>
            <Link href="/" className="beta-btn-ghost">
              Role switcher
            </Link>
          </>
        )
      }}
      sidebarFooter={
        <div className="space-y-2 text-xs text-slate-300">
          <p className="uppercase tracking-[0.14em] text-slate-400">Business mode</p>
          <p>Campaign write APIs are deferred in this phase.</p>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
