import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusPill } from "@/components/status-pill";
import { BUSINESS_STREAMERS, getBusinessCampaignById, getBusinessCampaignStaticParams } from "@/lib/business-mock";

interface BusinessCampaignDetailPageProps {
  params: {
    id: string;
  };
}

function tone(status: string): "success" | "warning" | "danger" | "info" | "neutral" {
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

export function generateStaticParams() {
  return getBusinessCampaignStaticParams();
}

export default function BusinessCampaignDetailPage({ params }: BusinessCampaignDetailPageProps) {
  const campaign = getBusinessCampaignById(params.id);

  if (!campaign) {
    notFound();
  }

  const assigned = BUSINESS_STREAMERS.slice(0, Math.max(1, Math.min(BUSINESS_STREAMERS.length, campaign.assignedStreamers / 8 || 1)));
  const utilization = campaign.budget > 0 ? Math.round((campaign.spent / campaign.budget) * 100) : 0;

  return (
    <div className="space-y-4">
      <section className="beta-panel">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Campaign ID, {campaign.id}</p>
            <h2 className="beta-panel-title mt-1">{campaign.name}</h2>
            <p className="beta-panel-subtitle">{campaign.objective}</p>
          </div>
          <StatusPill tone={tone(campaign.status)}>{campaign.status}</StatusPill>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <article className="beta-kpi-card">
            <p className="beta-kpi-label">Budget</p>
            <p className="beta-kpi-value text-2xl">
              {campaign.currency} {campaign.budget.toLocaleString("en-US")}
            </p>
          </article>
          <article className="beta-kpi-card">
            <p className="beta-kpi-label">Spent</p>
            <p className="beta-kpi-value text-2xl">
              {campaign.currency} {campaign.spent.toLocaleString("en-US")}
            </p>
          </article>
          <article className="beta-kpi-card">
            <p className="beta-kpi-label">Impressions</p>
            <p className="beta-kpi-value text-2xl">{campaign.impressions.toLocaleString("en-US")}</p>
          </article>
          <article className="beta-kpi-card">
            <p className="beta-kpi-label">Clicks</p>
            <p className="beta-kpi-value text-2xl">{campaign.clicks.toLocaleString("en-US")}</p>
          </article>
        </div>

        <div className="mt-4 rounded-lg border border-slate-600/60 bg-slate-900/70 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-slate-200">Budget utilization</p>
            <p className="text-sm font-semibold text-slate-100">{utilization}%</p>
          </div>
          <div className="mt-2 h-2 rounded-full bg-slate-950/90">
            <div className="h-2 rounded-full bg-gradient-to-r from-rose-500 to-cyan-400" style={{ width: `${utilization}%` }} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <article className="beta-panel">
          <h3 className="beta-panel-title">Assigned streamers</h3>
          <div className="mt-3 space-y-2">
            {assigned.map((streamer) => (
              <article key={streamer.id} className="rounded-lg border border-slate-600/60 bg-slate-900/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-white">{streamer.handle}</p>
                  <StatusPill tone={streamer.verified ? "success" : "warning"}>{streamer.verified ? "verified" : "pending"}</StatusPill>
                </div>
                <p className="mt-1 text-sm text-slate-300">{streamer.country} , {streamer.language}</p>
                <p className="mt-1 text-xs text-slate-400">Avg viewers, {streamer.avgViewers}</p>
              </article>
            ))}
          </div>
        </article>

        <aside className="space-y-4">
          <article className="beta-panel">
            <h3 className="beta-panel-title">Actions</h3>
            <div className="mt-3 grid gap-2">
              <button type="button" className="beta-btn-primary">Trigger delivery test</button>
              <button type="button" className="beta-btn-ghost">Assign streamers</button>
              <button type="button" className="beta-btn-ghost">Open proof timeline</button>
            </div>
          </article>

          <article className="beta-panel">
            <h3 className="beta-panel-title">Back</h3>
            <Link href="/business/campaigns" className="beta-btn-ghost mt-3 inline-flex">
              Return to campaign list
            </Link>
          </article>
        </aside>
      </section>
    </div>
  );
}
