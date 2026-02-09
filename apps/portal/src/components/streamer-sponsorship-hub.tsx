"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { STREAMER_AVAILABLE_SPONSORSHIPS, STREAMER_FINISHED_SPONSORSHIPS } from "@/lib/streamer-mock";
import { useStreamerFlowState } from "@/lib/streamer-flow-store";
import type { SponsorshipCard, SponsorshipTab } from "@/types/streamer";

function statusClasses(status: SponsorshipCard["status"]): string {
  if (status === "active") {
    return "bg-emerald-500/15 text-emerald-200 border border-emerald-300/30";
  }

  if (status === "scheduled") {
    return "bg-cyan-500/15 text-cyan-200 border border-cyan-300/30";
  }

  return "bg-slate-700/50 text-slate-200 border border-slate-500/40";
}

export function StreamerSponsorshipHub() {
  const { state, setState } = useStreamerFlowState();
  const [activeTab, setActiveTab] = useState<SponsorshipTab>("available");

  const joinedSet = useMemo(() => new Set(state.joinedCampaignIds), [state.joinedCampaignIds]);

  const availableCards = useMemo(
    () => STREAMER_AVAILABLE_SPONSORSHIPS.filter((card) => !joinedSet.has(card.campaignId)),
    [joinedSet]
  );
  const myCards = useMemo(
    () => STREAMER_AVAILABLE_SPONSORSHIPS.filter((card) => joinedSet.has(card.campaignId)),
    [joinedSet]
  );

  const toggleJoin = (card: SponsorshipCard) => {
    setState((previous) => {
      const alreadyJoined = previous.joinedCampaignIds.includes(card.campaignId);
      const joinedCampaignIds = alreadyJoined
        ? previous.joinedCampaignIds.filter((id) => id !== card.campaignId)
        : [...previous.joinedCampaignIds, card.campaignId];

      return {
        ...previous,
        joinedCampaignIds,
        selectedCampaignId:
          alreadyJoined && previous.selectedCampaignId === card.campaignId
            ? null
            : alreadyJoined
              ? previous.selectedCampaignId
              : card.campaignId
      };
    });
  };

  const cards = activeTab === "available" ? availableCards : myCards;

  return (
    <main className="space-y-6">
      {!state.providerConnected ? (
        <div className="rounded-2xl border border-amber-300/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-200 shadow-sm">
          Connect Twitch first to join sponsorships.
          <Link href="/streamer/login" className="ml-2 font-semibold underline">
            Go to login
          </Link>
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <article className="streamer-surface-card streamer-beta-grid rounded-3xl p-6 md:p-8">
          <p className="streamer-surface-chip inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
            Marketplace
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-heading)] text-5xl font-semibold tracking-tight text-slate-50">Campaign marketplace</h1>
          <p className="mt-3 max-w-2xl text-base text-slate-300">
            Join campaigns that fit your content, then complete setup and activate campaign workflows while streaming.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-700/60 pb-2">
            <button
              type="button"
              data-testid="sponsorship-tab-my"
              className={`streamer-tab-btn rounded-lg px-3 py-2 text-sm font-semibold transition ${
                activeTab === "my" ? "streamer-tab-btn-active" : ""
              }`}
              onClick={() => setActiveTab("my")}
            >
              My sponsorships
            </button>
            <button
              type="button"
              data-testid="sponsorship-tab-available"
              className={`streamer-tab-btn rounded-lg px-3 py-2 text-sm font-semibold transition ${
                activeTab === "available" ? "streamer-tab-btn-active" : ""
              }`}
              onClick={() => setActiveTab("available")}
            >
              Available sponsorships
            </button>
          </div>

          {cards.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/55 px-4 py-8 text-center text-sm text-slate-300">
              {activeTab === "available"
                ? "No available campaigns at the moment."
                : "No joined campaigns yet. Open Available sponsorships and join one."}
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {cards.map((card) => {
                const isJoined = joinedSet.has(card.campaignId);

                return (
                  <article key={card.id} data-testid={`sponsorship-card-${card.campaignId}`} className="streamer-market-card overflow-hidden rounded-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={card.imageUrl} alt={card.imageAlt} className="h-36 w-full object-cover" />
                    <div className="space-y-3 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-lg font-semibold text-slate-50">{card.title}</p>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusClasses(card.status)}`}>
                          {card.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">{card.brand}</p>
                      <p className="text-sm leading-relaxed text-slate-300">{card.description}</p>
                      <p className="text-sm font-semibold text-cyan-200">{card.payoutLabel}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href={`/streamer/workspace?campaign=${card.campaignSlug}`}
                          className="streamer-ghost-btn rounded-lg px-3 py-2 text-center text-sm font-semibold text-slate-100 transition hover:border-cyan-300/70"
                        >
                          View details
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleJoin(card)}
                          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                            isJoined
                              ? "border border-rose-300/35 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
                              : "streamer-primary-btn text-white"
                          }`}
                          disabled={!state.providerConnected}
                        >
                          {isJoined ? "Leave" : "Join"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </article>

        <aside className="space-y-4">
          <div className="streamer-faq-card rounded-2xl p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">FAQ</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-50">What permissions does Beta Ads require?</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              We only request platform data needed to verify channel identity, campaign eligibility, and payout readiness.
            </p>
            <Link href="/streamer/setup" className="mt-4 inline-flex text-sm font-semibold text-emerald-300 underline">
              Read setup guidance
            </Link>
          </div>

          <div className="streamer-outline-card rounded-2xl p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Readiness</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950/55 px-3 py-2">
                <span className="text-slate-200">Provider</span>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${state.providerConnected ? "bg-emerald-500/20 text-emerald-200" : "bg-amber-500/20 text-amber-200"}`}>
                  {state.providerConnected ? "connected" : "pending"}
                </span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-950/55 px-3 py-2">
                <span className="text-slate-200">OBS setup</span>
                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${state.setupCompleted ? "bg-emerald-500/20 text-emerald-200" : "bg-slate-600/40 text-slate-200"}`}>
                  {state.setupCompleted ? "complete" : "pending"}
                </span>
              </li>
            </ul>
          </div>
        </aside>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight text-slate-50">Featured finished sponsorships</h2>
          <p className="text-sm text-slate-300">See completed campaign collaborations from previous flights.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {STREAMER_FINISHED_SPONSORSHIPS.map((card) => (
            <article key={card.id} className="streamer-finished-card overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.imageUrl} alt={card.imageAlt} className="h-36 w-full object-cover" />
              <div className="p-4">
                <p className="text-base font-semibold text-slate-50">{card.title}</p>
                <p className="mt-1 text-sm text-slate-300">{card.brand}</p>
                <span className="mt-3 inline-flex rounded-full border border-slate-500/40 bg-slate-800/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                  finished
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
