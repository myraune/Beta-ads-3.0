import Link from "next/link";
import { StatusPill } from "@/components/status-pill";
import { ADMIN_INCIDENTS, ADMIN_KPIS } from "@/lib/admin-mock";

function incidentTone(severity: string): "success" | "warning" | "danger" {
  if (severity === "high") {
    return "danger";
  }

  if (severity === "medium") {
    return "warning";
  }

  return "success";
}

export function AdminDashboard() {
  return (
    <div className="space-y-4">
      <section className="beta-panel">
        <h2 className="beta-panel-title">Operations pulse</h2>
        <p className="beta-panel-subtitle">Real-time reliability and governance snapshot.</p>
        <div className="beta-kpi-grid mt-4">
          {ADMIN_KPIS.map((kpi) => (
            <article key={kpi.label} className="beta-kpi-card">
              <p className="beta-kpi-label">{kpi.label}</p>
              <p className="beta-kpi-value">{kpi.value}</p>
              <p className="beta-kpi-delta">{kpi.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <article className="beta-panel">
          <div className="flex items-center justify-between gap-2">
            <h3 className="beta-panel-title">Open incidents</h3>
            <Link href="/admin/system" className="beta-btn-ghost">
              View system health
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {ADMIN_INCIDENTS.map((incident) => (
              <article key={incident.id} className="rounded-lg border border-slate-600/60 bg-slate-900/70 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-white">{incident.title}</p>
                  <StatusPill tone={incidentTone(incident.severity)}>{incident.severity}</StatusPill>
                </div>
                <p className="mt-1 text-sm text-slate-300">Service, {incident.service}</p>
                <p className="mt-1 text-xs text-slate-400">Opened at {incident.openedAt}</p>
              </article>
            ))}
          </div>
        </article>

        <aside className="space-y-4">
          <article className="beta-panel">
            <h3 className="beta-panel-title">Admin shortcuts</h3>
            <div className="mt-3 grid gap-2">
              <Link href="/admin/campaigns" className="beta-btn-primary inline-flex items-center justify-center">
                Campaign moderation
              </Link>
              <Link href="/admin/payouts" className="beta-btn-ghost inline-flex items-center justify-center">
                Payout queue
              </Link>
              <Link href="/admin/events" className="beta-btn-ghost inline-flex items-center justify-center">
                Audit events
              </Link>
            </div>
          </article>

          <article className="beta-panel">
            <h3 className="beta-panel-title">Control rules</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li className="rounded-lg border border-slate-600/55 bg-slate-900/70 px-3 py-2">Never count impressions before ad_completed.</li>
              <li className="rounded-lg border border-slate-600/55 bg-slate-900/70 px-3 py-2">Protect overlay keys from logs and dashboards.</li>
              <li className="rounded-lg border border-slate-600/55 bg-slate-900/70 px-3 py-2">Rate limit ingest by overlay key and IP.</li>
            </ul>
          </article>
        </aside>
      </section>
    </div>
  );
}
