"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { useStreamerFlowState } from "@/lib/streamer-flow-store";
import type { StreamerShellNavItem } from "@/types/streamer";

const NAV_ITEMS: StreamerShellNavItem[] = [
  { id: "sponsorships", label: "Sponsorships", href: "/streamer" },
  { id: "clips", label: "My clips", comingSoon: true },
  { id: "wallet", label: "Wallet", comingSoon: true },
  { id: "statistics", label: "Statistics", comingSoon: true },
  { id: "help", label: "Help", comingSoon: true }
];

function isSponsorshipRoute(pathname: string): boolean {
  return pathname.startsWith("/streamer");
}

export function StreamerShellNav() {
  const pathname = usePathname();
  const { state } = useStreamerFlowState();

  return (
    <header className="streamer-shell-nav sticky top-0 z-30 border-b border-slate-700/70 backdrop-blur">
      <div className="mx-auto flex max-w-[1700px] flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-5">
          <Link href="/streamer" className="flex items-center gap-3 text-slate-100" aria-label="Beta Ads streamer home">
            <BrandLogo kind="horizontal" surface="dark" size="md" className="streamer-brand-logo streamer-brand-logo--horizontal" />
            <span className="streamer-brand-chip rounded-full border border-cyan-300/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-cyan-200">
              Stream Ops
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-700/60 bg-slate-950/45 p-1">
            {NAV_ITEMS.map((item) => {
              const active = item.id === "sponsorships" && isSponsorshipRoute(pathname);

              if (item.href && !item.comingSoon) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`streamer-nav-link rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      active ? "streamer-nav-link-active" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  className="streamer-nav-soon inline-flex cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500"
                  aria-disabled="true"
                >
                  {item.label}
                  <span className="rounded-full border border-slate-600 bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                    Soon
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              state.providerConnected
                ? "border-emerald-300/40 bg-emerald-500/10 text-emerald-200"
                : "border-amber-300/40 bg-amber-500/10 text-amber-200"
            }`}
          >
            {state.providerConnected ? "Twitch connected" : "Connect Twitch"}
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              state.setupCompleted
                ? "border-cyan-300/40 bg-cyan-500/10 text-cyan-200"
                : "border-slate-600/60 bg-slate-900/70 text-slate-300"
            }`}
          >
            {state.setupCompleted ? "Setup complete" : "Setup pending"}
          </span>
          <Link href="/streamer/setup" className="streamer-ghost-btn rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-cyan-300/60">
            OBS setup
          </Link>
        </div>
      </div>
    </header>
  );
}
