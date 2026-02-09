import { StatusPill } from "@/components/status-pill";
import { ADMIN_INCIDENTS, ADMIN_SYSTEM_METRICS } from "@/lib/admin-mock";

export function AdminSystemHealth() {
  return (
    <div className="space-y-4">
      <section className="beta-panel">
        <h2 className="beta-panel-title">System metrics</h2>
        <p className="beta-panel-subtitle">Latency, queue depth, and heartbeat health.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {ADMIN_SYSTEM_METRICS.map((metric) => (
            <article key={metric.id} className="rounded-lg border border-slate-600/55 bg-slate-900/70 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">{metric.label}</p>
                <StatusPill tone={metric.status === "healthy" ? "success" : metric.status === "warning" ? "warning" : "danger"}>
                  {metric.status}
                </StatusPill>
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">{metric.current}</p>
              <p className="text-xs text-slate-400">Target, {metric.target}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="beta-panel">
        <h3 className="beta-panel-title">Incident timeline</h3>
        <ul className="mt-3 space-y-2">
          {ADMIN_INCIDENTS.map((incident) => (
            <li key={incident.id} className="rounded-lg border border-slate-600/55 bg-slate-900/70 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-white">{incident.title}</p>
                <StatusPill tone={incident.status === "resolved" ? "success" : incident.status === "monitoring" ? "info" : "warning"}>
                  {incident.status}
                </StatusPill>
              </div>
              <p className="mt-1 text-sm text-slate-300">{incident.service}</p>
              <p className="mt-1 text-xs text-slate-400">{incident.openedAt}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
