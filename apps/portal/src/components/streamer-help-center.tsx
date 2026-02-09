"use client";

import { useMemo, useState } from "react";
import { STREAMER_HELP_DATA } from "@/lib/streamer-mock";
import { StatusPill } from "@/components/status-pill";

function ticketTone(status: string): "info" | "warning" | "success" {
  if (status === "resolved") {
    return "success";
  }

  if (status === "waiting") {
    return "warning";
  }

  return "info";
}

export function StreamerHelpCenter() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | "general" | "setup" | "payouts">("all");

  const faqs = useMemo(() => {
    return STREAMER_HELP_DATA.faqs.filter((item) => {
      const categoryMatch = category === "all" ? true : item.category === category;
      const queryMatch = query
        ? item.question.toLowerCase().includes(query.toLowerCase()) || item.answer.toLowerCase().includes(query.toLowerCase())
        : true;
      return categoryMatch && queryMatch;
    });
  }, [category, query]);

  return (
    <main className="space-y-4">
      <section className="streamer-card rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--streamer-muted)]">Help center</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Support and FAQs</h2>
        <p className="mt-2 text-sm text-slate-300">Search troubleshooting, setup guidance, and payout support.</p>

        <div className="mt-4 grid gap-2 md:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto]">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search help articles"
            className="beta-field"
          />
          <button type="button" onClick={() => setCategory("all")} className={`beta-btn-ghost ${category === "all" ? "border-cyan-300/60" : ""}`}>
            All
          </button>
          <button type="button" onClick={() => setCategory("general")} className={`beta-btn-ghost ${category === "general" ? "border-cyan-300/60" : ""}`}>
            General
          </button>
          <button type="button" onClick={() => setCategory("setup")} className={`beta-btn-ghost ${category === "setup" ? "border-cyan-300/60" : ""}`}>
            Setup
          </button>
          <button type="button" onClick={() => setCategory("payouts")} className={`beta-btn-ghost ${category === "payouts" ? "border-cyan-300/60" : ""}`}>
            Payouts
          </button>
        </div>
      </section>

      <section className="streamer-card rounded-2xl p-5">
        <h3 className="text-xl font-semibold text-white">Frequently asked questions</h3>
        <div className="mt-3 space-y-2">
          {faqs.map((faq) => (
            <details key={faq.id} className="rounded-lg border border-white/15 bg-black/25 px-3 py-2">
              <summary className="cursor-pointer list-none text-sm font-semibold text-white">{faq.question}</summary>
              <p className="mt-2 text-sm text-slate-300">{faq.answer}</p>
            </details>
          ))}
          {faqs.length === 0 ? <p className="text-sm text-slate-300">No FAQ matches your search.</p> : null}
        </div>
      </section>

      <section className="streamer-card rounded-2xl p-5">
        <h3 className="text-xl font-semibold text-white">Support tickets</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="beta-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {STREAMER_HELP_DATA.tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.id}</td>
                  <td>{ticket.subject}</td>
                  <td>
                    <StatusPill tone={ticketTone(ticket.status)}>{ticket.status}</StatusPill>
                  </td>
                  <td>{new Date(ticket.updatedAt).toLocaleString("en-US", { timeZone: "UTC" })} UTC</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
