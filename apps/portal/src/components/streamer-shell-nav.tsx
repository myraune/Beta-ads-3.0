"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    <header className="streamer-shell-nav sticky top-0 z-30 border-b border-slate-200/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1700px] flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-5">
          <Link href="/streamer" className="flex items-center gap-2 text-ink">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-sm font-bold text-white shadow-[0_8px_18px_rgba(14,116,248,0.35)]">
              B
            </span>
            <span className="font-[family-name:var(--font-heading)] text-lg font-semibold tracking-tight">Beta Ads</span>
          </Link>

          <nav className="flex flex-wrap items-center gap-1 rounded-xl border border-slate-200/80 bg-white/80 p-1">
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
                  <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
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
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            {state.providerConnected ? "Twitch connected" : "Connect Twitch"}
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              state.setupCompleted ? "border-cyan-200 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-slate-100 text-slate-600"
            }`}
          >
            {state.setupCompleted ? "Setup complete" : "Setup pending"}
          </span>
          <Link href="/streamer/setup" className="streamer-ghost-btn rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400">
            OBS setup
          </Link>
        </div>
      </div>
    </header>
  );
}
