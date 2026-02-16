import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

const portals = [
  {
    href: "/business",
    title: "Business Platform",
    summary: "Streamer explorer, campaign wizard, reporting exports, and billing visibility.",
    cta: "Open Business"
  },
  {
    href: "/streamer/login",
    title: "Streamer Platform",
    summary: "Connect Twitch, run OBS setup, manage sponsorships, and track payouts.",
    cta: "Open Streamer"
  },
  {
    href: "/admin",
    title: "Admin Platform",
    summary: "Moderation queue, risk operations, audit timeline, and system health.",
    cta: "Open Admin"
  }
];

const highlights = [
  { label: "Platform model", value: "Admin, Business, Streamer" },
  { label: "Delivery policy", value: "Impression = ad_completed" },
  { label: "Time standard", value: "UTC globally enforced" }
];

export default function HomePage() {
  return (
    <main className="beta-home-shell mx-auto min-h-screen max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <div className="beta-home-frame rounded-3xl p-5 md:p-8">
        <header className="beta-home-hero rounded-2xl p-6 md:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="streamer-brand-mark-shell inline-flex items-center justify-center rounded-xl border border-rose-300/30 bg-rose-500/10 p-2">
                <BrandLogo kind="mark" surface="dark" size="md" dataTestId="home-brand-mark" className="streamer-brand-logo streamer-brand-logo--mark" />
              </span>
              <BrandLogo kind="horizontal" surface="dark" size="md" dataTestId="home-brand-logo" className="streamer-brand-logo streamer-brand-logo--horizontal" />
            </div>
            <p className="inline-flex rounded-full border border-rose-300/35 bg-rose-500/10 px-3 py-1 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.24em] text-rose-200">
              Beta Live Ads Platform
            </p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <h1 className="font-[family-name:var(--font-heading)] text-4xl font-semibold tracking-tight text-slate-50 md:text-5xl">
                Three role system for live ad delivery
              </h1>
              <p className="mt-4 max-w-3xl text-base text-slate-300 md:text-lg">
                Business launches campaigns, streamers deliver placements with proof events, and admin governs reliability with payout oversight.
              </p>
            </div>

            <div className="space-y-3">
              {highlights.map((item) => (
                <article key={item.label} className="beta-home-signal-card rounded-xl p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-base font-semibold text-slate-100">{item.value}</p>
                </article>
              ))}
            </div>
          </div>
        </header>

        <section className="beta-home-grid mt-6 grid gap-4 md:grid-cols-3">
          {portals.map((portal) => (
            <Link key={portal.href} href={portal.href} className="beta-home-card group rounded-2xl p-5 transition duration-150">
              <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-white">{portal.title}</h2>
              <p className="mt-3 min-h-[72px] text-sm leading-relaxed text-slate-300">{portal.summary}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-rose-200">
                {portal.cta}
                <span aria-hidden="true">-&gt;</span>
              </span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
