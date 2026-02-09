"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LiveFeed } from "@/components/live-feed";
import { fetchCampaigns } from "@/lib/api";

type Campaign = { id: string; name: string; status: string; advertiser: string };

interface BusinessPortalPageProps {
  showAgencyAliasNotice?: boolean;
}

export function BusinessPortalPage(props: BusinessPortalPageProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      const response = await fetchCampaigns();
      if (mounted) {
        setCampaigns(response ?? []);
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const activeCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.status.toLowerCase() === "approved").length,
    [campaigns]
  );

  return (
    <main className="portal-shell mx-auto min-h-screen max-w-6xl px-6 py-8">
      <div className="portal-frame space-y-6 rounded-3xl p-6 md:p-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="portal-chip inline-flex rounded-full px-3 py-1 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.22em]">
              Business Portal
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-heading)] text-4xl font-semibold tracking-tight text-ink">
              Marketplace and Campaign Launch
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-ink/70 md:text-base">
              Browse the streamer marketplace, launch brand campaigns, and monitor delivery confidence in real time.
            </p>
          </div>
          <div className="grid min-w-[220px] gap-2 text-right">
            <div className="rounded-xl border border-ink/10 bg-white/75 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/55">Campaign count</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{loading ? "-" : campaigns.length}</p>
            </div>
            <div className="rounded-xl border border-ink/10 bg-white/75 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/55">Approved</p>
              <p className="mt-1 text-2xl font-semibold text-ink">{loading ? "-" : activeCampaigns}</p>
            </div>
          </div>
        </header>

        {props.showAgencyAliasNotice ? (
          <div className="rounded-xl border border-blue-200/60 bg-blue-50/70 px-4 py-3 text-sm text-blue-900">
            This is a legacy route. The primary customer portal is now{" "}
            <Link href="/business" className="font-semibold underline">
              /business
            </Link>
            .
          </div>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="portal-card rounded-2xl p-5">
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-ink">Campaigns</h2>
            <p className="mt-1 text-sm text-ink/65">Current portfolio and approval state from the API.</p>

            {loading ? (
              <p className="mt-5 rounded-xl border border-ink/10 bg-white/75 px-4 py-5 text-sm text-ink/70">
                Loading campaigns...
              </p>
            ) : campaigns.length === 0 ? (
              <p className="mt-5 rounded-xl border border-ink/10 bg-white/75 px-4 py-5 text-sm text-ink/70">
                No campaigns found. Create one through `POST /campaigns`.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {campaigns.map((campaign) => (
                  <li key={campaign.id} className="rounded-xl border border-ink/10 bg-white/75 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-ink">{campaign.name}</p>
                        <p className="mt-1 text-sm text-ink/70">Advertiser: {campaign.advertiser}</p>
                      </div>
                      <span className="rounded-full border border-ink/15 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink/75">
                        {campaign.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <LiveFeed />
        </section>
      </div>
    </main>
  );
}
