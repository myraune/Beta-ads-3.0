import Link from "next/link";

const portals = [
  {
    href: "/business",
    title: "Business Portal",
    summary: "Agency and brand workspace with streamer marketplace, campaign launch, and live reporting.",
    cta: "Open Business"
  },
  {
    href: "/streamer/login",
    title: "Streamer Workspace",
    summary: "Campaign brief, requirements, and overlay controls with real-time status.",
    cta: "Open Streamer"
  },
  {
    href: "/admin",
    title: "Admin Operations",
    summary: "Audit timeline, payout control, and reliability visibility across sessions.",
    cta: "Open Admin"
  }
];

const highlights = [
  { label: "Platform model", value: "Admin, Business, Streamer" },
  { label: "Delivery policy", value: "Impression = ad_completed" },
  { label: "Time standard", value: "UTC across all events" }
];

export default function HomePage() {
  return (
    <main className="portal-shell mx-auto min-h-screen max-w-6xl px-6 py-10">
      <div className="portal-frame rounded-3xl p-6 md:p-8">
        <header className="rounded-2xl border border-ink/10 bg-white/60 p-6 backdrop-blur">
          <p className="portal-chip inline-flex rounded-full px-3 py-1 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.24em]">
            Beta Live Ads Platform
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            Modern Control Surface for Live Stream Advertising
          </h1>
          <p className="mt-4 max-w-3xl text-base text-ink/75 md:text-lg">
            This software provides campaign orchestration, streamer delivery control, and proof-based reporting through
            three dedicated platforms, Admin for Beta Ads operations, Business for customers, and Streamer for campaign delivery.
          </p>
        </header>

        <section className="portal-grid-bg mt-6 grid gap-3 rounded-2xl border border-ink/10 bg-white/45 p-3 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.label} className="rounded-xl border border-ink/10 bg-white/80 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-ink/55">{item.label}</p>
              <p className="mt-2 text-lg font-semibold text-ink">{item.value}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {portals.map((portal) => (
            <Link
              key={portal.href}
              href={portal.href}
              className="portal-card group rounded-2xl p-5 transition duration-150 hover:-translate-y-0.5"
            >
              <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-ink">{portal.title}</h2>
              <p className="mt-3 min-h-[72px] text-sm leading-relaxed text-ink/75">{portal.summary}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#1f4f99]">
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
