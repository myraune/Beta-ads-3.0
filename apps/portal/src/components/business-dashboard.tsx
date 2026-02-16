import Link from "next/link";
import { StatusPill } from "@/components/status-pill";
import { BUSINESS_CAMPAIGNS, BUSINESS_KPIS } from "@/lib/business-mock";

function campaignTone(status: string): "success" | "warning" | "danger" | "info" | "neutral" {
  if (status === "live" || status === "approved") {
    return "success";
  }

  if (status === "submitted") {
    return "warning";
  }

  if (status === "rejected") {
    return "danger";
  }

  if (status === "draft") {
    return "info";
  }

  return "neutral";
}

export function BusinessDashboard() {
  const liveCount = BUSINESS_CAMPAIGNS.filter((campaign) => campaign.status === "live").length;
  const draftCount = BUSINESS_CAMPAIGNS.filter((campaign) => campaign.status === "draft").length;

  return (
    <div className="space-y-4">
      <section className="beta-panel">
        <h2 className="beta-panel-title">Portfolio signal</h2>
        <p className="beta-panel-subtitle">Campaign pacing, launch readiness, and delivery outcomes in one view.</p>
        <div className="beta-kpi-grid mt-4">
          {BUSINESS_KPIS.map((kpi) => (
            <article key={kpi.label} className="beta-kpi-card">
              <p className="beta-kpi-label">{kpi.label}</p>
              <p className="beta-kpi-value">{kpi.value}</p>
              <p className="beta-kpi-delta">{kpi.delta}</p>
            </article>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-600/60 bg-slate-950/55 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Flight state</p>
            <p className="mt-2 text-sm text-slate-200">
              <span className="font-semibold text-emerald-200">{liveCount}</span> live campaigns and{" "}
              <span className="font-semibold text-sky-200">{draftCount}</span> in draft.
            </p>
          </div>
          <div className="rounded-xl border border-slate-600/60 bg-slate-950/55 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Proof policy</p>
            <p className="mt-2 text-sm text-slate-200">Impressions count only on <code>ad_completed</code>.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <article className="beta-panel">
          <h3 className="beta-panel-title">Campaign pipeline</h3>
          <p className="beta-panel-subtitle">Current campaigns across draft, approval, and live stages.</p>
          <div className="mt-3 overflow-x-auto">
            <table className="beta-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th>Budget</th>
                  <th>Assigned streamers</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {BUSINESS_CAMPAIGNS.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>
                      <p className="font-semibold">{campaign.name}</p>
                      <p className="text-xs text-slate-400">{campaign.advertiser}</p>
                    </td>
                    <td>
                      <StatusPill tone={campaignTone(campaign.status)}>{campaign.status}</StatusPill>
                    </td>
                    <td>
                      {campaign.currency} {campaign.budget.toLocaleString("en-US")}
                    </td>
                    <td>{campaign.assignedStreamers}</td>
                    <td>
                      <Link href={`/business/campaigns/${campaign.id}`} className="beta-btn-ghost inline-flex">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="space-y-4">
          <article className="beta-panel">
            <h3 className="beta-panel-title">Launch actions</h3>
            <p className="beta-panel-subtitle">Most common operations for campaign managers.</p>
            <div className="mt-3 grid gap-2">
              <Link href="/business/campaigns/new" className="beta-btn-primary inline-flex items-center justify-center">
                New campaign
              </Link>
              <Link href="/business/marketplace" className="beta-btn-ghost inline-flex items-center justify-center">
                Open streamer explorer
              </Link>
              <Link href="/business/reports" className="beta-btn-ghost inline-flex items-center justify-center">
                View reports
              </Link>
            </div>
          </article>

          <article className="beta-panel">
            <h3 className="beta-panel-title">Reliability notes</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li className="rounded-lg border border-slate-600/60 bg-slate-900/60 px-3 py-2">
                Impression definition, ad_completed only.
              </li>
              <li className="rounded-lg border border-slate-600/60 bg-slate-900/60 px-3 py-2">
                Time standard, UTC across reports and payouts.
              </li>
              <li className="rounded-lg border border-slate-600/60 bg-slate-900/60 px-3 py-2">
                Session split rule, reconnect over 5 minutes starts new session.
              </li>
            </ul>
          </article>
        </aside>
      </section>
    </div>
  );
}
