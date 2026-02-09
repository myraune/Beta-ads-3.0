import { ADMIN_AUDIT_EVENTS } from "@/lib/admin-mock";

export function AdminAuditTimeline() {
  return (
    <section className="beta-panel">
      <h2 className="beta-panel-title">Audit timeline</h2>
      <p className="beta-panel-subtitle">Append-only trail of operational and security events.</p>
      <ul className="mt-4 space-y-3">
        {ADMIN_AUDIT_EVENTS.map((entry) => (
          <li key={entry.id} className="rounded-lg border border-slate-600/55 bg-slate-900/70 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">{entry.action}</p>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{entry.createdAt}</p>
            </div>
            <p className="mt-1 text-sm text-slate-300">Actor, {entry.actor}</p>
            <p className="mt-1 text-sm text-slate-300">{entry.detail}</p>
            <p className="mt-1 text-xs text-slate-400">Entity, {entry.entityType}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
