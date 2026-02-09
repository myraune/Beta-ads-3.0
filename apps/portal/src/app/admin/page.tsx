"use client";

import { useEffect, useState } from "react";
import { fetchAudit } from "@/lib/api";

type AuditEntry = { id: string; action: string; entityType: string; createdAt: string };

export default function AdminPortalPage() {
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      const response = await fetchAudit();
      if (mounted) {
        setAudit(response ?? []);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="portal-shell mx-auto min-h-screen max-w-6xl px-6 py-8">
      <div className="portal-frame rounded-3xl p-6 md:p-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="portal-chip inline-flex rounded-full px-3 py-1 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em]">
              Admin Portal
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-heading)] text-4xl font-semibold tracking-tight text-ink">
              Operations and Audit
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-ink/70 md:text-base">
              Review system actions, payout operations, and compliance events in one timeline.
            </p>
          </div>
          <div className="rounded-xl border border-ink/10 bg-white/75 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/55">Recent entries</p>
            <p className="mt-1 text-3xl font-semibold text-ink">{loading ? "-" : audit.length}</p>
          </div>
        </header>

        <section className="portal-card mt-6 rounded-2xl p-5">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-ink">Recent Audit Events</h2>
          <p className="mt-1 text-sm text-ink/65">Append-only visibility for sensitive operational actions.</p>

          {loading ? (
            <p className="mt-5 rounded-xl border border-ink/10 bg-white/75 px-4 py-5 text-sm text-ink/70">Loading audit entries...</p>
          ) : audit.length === 0 ? (
            <p className="mt-5 rounded-xl border border-ink/10 bg-white/75 px-4 py-5 text-sm text-ink/70">
              No audit entries available yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {audit.map((entry) => (
                <li key={entry.id} className="rounded-xl border border-ink/10 bg-white/75 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-base font-semibold text-ink">{entry.action}</p>
                      <p className="mt-1 text-sm text-ink/70">Entity: {entry.entityType}</p>
                    </div>
                    <p className="font-[family-name:var(--font-mono)] text-xs text-ink/60">{entry.createdAt}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
