"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { navForRole } from "@/lib/platform-nav";

function adminTopbarMeta(pathname: string): { title: string; subtitle: string; badges: Array<{ label: string; tone?: "neutral" | "info" | "success" | "warning" | "danger" }> } {
  if (pathname.startsWith("/admin/campaigns")) {
    return {
      title: "Campaign moderation",
      subtitle: "Review and decide campaign approval states.",
      badges: [{ label: "Moderation" }, { label: "Review queue", tone: "warning" }]
    };
  }

  if (pathname.startsWith("/admin/streamers")) {
    return {
      title: "Streamer risk console",
      subtitle: "Operational quality and risk flags.",
      badges: [{ label: "Risk" }, { label: "Safety", tone: "warning" }]
    };
  }

  if (pathname.startsWith("/admin/events")) {
    return {
      title: "Audit events",
      subtitle: "Append-only operational event trail.",
      badges: [{ label: "Audit" }, { label: "Immutable", tone: "info" }]
    };
  }

  if (pathname.startsWith("/admin/payouts")) {
    return {
      title: "Payout operations",
      subtitle: "Queue settlement and manual paid marking.",
      badges: [{ label: "Finance" }, { label: "Manual actions", tone: "warning" }]
    };
  }

  if (pathname.startsWith("/admin/system")) {
    return {
      title: "System reliability",
      subtitle: "Health, latency, and queue depth diagnostics.",
      badges: [{ label: "SRE" }, { label: "Live", tone: "success" }]
    };
  }

  return {
    title: "Admin operations",
    subtitle: "Govern campaigns, payouts, and service reliability from one command center.",
    badges: [{ label: "Admin" }, { label: "Restricted", tone: "warning" }]
  };
}

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const meta = adminTopbarMeta(pathname);

  return (
    <AppShell
      role="admin"
      navItems={navForRole("admin")}
      activePath={pathname}
      topbar={{
        title: meta.title,
        subtitle: meta.subtitle,
        badges: meta.badges,
        actions: (
          <>
            <Link href="/admin/events" className="beta-btn-ghost">
              Audit
            </Link>
            <Link href="/" className="beta-btn-ghost">
              Role switcher
            </Link>
          </>
        )
      }}
      sidebarFooter={
        <div className="space-y-2 text-xs text-slate-300">
          <p className="uppercase tracking-[0.14em] text-slate-400">Admin mode</p>
          <p>Operational actions in this build are mock-only.</p>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
