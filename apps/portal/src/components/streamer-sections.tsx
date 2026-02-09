import type { StreamerSectionsProps } from "@/types/streamer";

function SectionCard(props: { children: React.ReactNode; className?: string }) {
  return <article className={`streamer-card rounded-2xl p-5 ${props.className ?? ""}`}>{props.children}</article>;
}

function StatTile(props: { label: string; value: string | number; tone?: "default" | "accent" }) {
  return (
    <div className="streamer-card-soft rounded-xl p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--streamer-muted)]">{props.label}</p>
      <p className={`mt-2 text-3xl font-semibold ${props.tone === "accent" ? "text-emerald-300" : "text-white"}`}>{props.value}</p>
    </div>
  );
}

export function StreamerSections(props: StreamerSectionsProps) {
  const selectedSlot = props.data.configuration.slots.find((slot) => slot.id === props.uiState.selectedOverlaySlot);

  if (props.uiState.activeSection === "general") {
    return (
      <section className="space-y-4" data-testid="streamer-section-general">
        <SectionCard>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--streamer-muted)]">General</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">Campaign snapshot</h2>
          <p className="mt-3 text-base leading-relaxed text-slate-200">{props.data.summary}</p>
          <div className="mt-4 inline-flex items-center rounded-full border border-white/15 bg-black/25 px-3 py-1 text-xs text-slate-300">
            Advertiser: {props.data.advertiser}
          </div>
        </SectionCard>

        <SectionCard>
          <h3 className="text-xl font-semibold text-white">Timeframe</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatTile label="Campaign start" value={props.data.timeframe.start} />
            <StatTile label="Campaign end" value={props.data.timeframe.end} />
          </div>
        </SectionCard>

        <SectionCard>
          <h3 className="text-xl font-semibold text-white">Revenue</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <StatTile label="Earned" value={props.data.revenue.earned} tone="accent" />
            <StatTile label="Pay per display" value={props.data.revenue.perDisplay} tone="accent" />
            <StatTile label="Potential" value={props.data.revenue.potential} tone="accent" />
          </div>
        </SectionCard>

        <SectionCard>
          <h3 className="text-xl font-semibold text-white">Ad displays</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <StatTile label="Completed" value={props.data.adDisplays.completed} />
            <StatTile label="Daily cap" value={props.data.adDisplays.dailyLimit} />
            <StatTile label="Total cap" value={props.data.adDisplays.totalLimit} />
          </div>
        </SectionCard>
      </section>
    );
  }

  if (props.uiState.activeSection === "brief") {
    return (
      <section className="space-y-4" data-testid="streamer-section-brief">
        <SectionCard>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--streamer-muted)]">Brief</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">{props.data.brief.headline}</h2>
          <ul className="mt-4 list-disc space-y-3 pl-6 text-base leading-relaxed text-slate-100">
            {props.data.brief.talkingPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard>
          <h3 className="text-xl font-semibold text-white">Reminder checklist</h3>
          <ul className="mt-4 space-y-2">
            {props.data.brief.reminders.map((reminder) => (
              <li key={reminder} className="streamer-card-soft flex items-start gap-2 rounded-lg p-3 text-sm text-slate-200">
                <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-black/30 text-xs">
                  v
                </span>
                <span>{reminder}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>
    );
  }

  if (props.uiState.activeSection === "requirements") {
    return (
      <section className="space-y-4" data-testid="streamer-section-requirements">
        {props.data.requirements.items.map((item) => (
          <SectionCard key={item.id}>
            <span className="inline-flex rounded-md border border-blue-300/30 bg-blue-500/15 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-blue-100">
              {item.statusLabel}
            </span>
            <h3 className="mt-3 text-2xl font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-base text-slate-200">{item.description}</p>
          </SectionCard>
        ))}

        <SectionCard>
          <h3 className="text-2xl font-semibold text-white">{props.data.requirements.banner.title}</h3>
          <div className="mt-3 rounded-lg border border-blue-300/30 bg-blue-950/35 px-4 py-3 text-sm text-blue-100">
            {props.data.requirements.banner.info}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_250px]">
            <div>
              <a
                href={props.data.requirements.banner.destinationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-lg border border-blue-200/30 bg-blue-900/35 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:border-blue-200/60"
              >
                {props.data.requirements.banner.cta}
              </a>
            </div>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={props.data.requirements.banner.imageUrl}
                alt={props.data.requirements.banner.imageAlt}
                className="h-64 w-full rounded-xl border border-white/15 object-cover"
              />
            </div>
          </div>

          <button
            type="button"
            className={`mt-5 rounded-lg border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              props.uiState.requirementsCompleted
                ? "border-emerald-300/40 bg-emerald-500/15 text-emerald-200"
                : "border-amber-300/40 bg-amber-500/10 text-amber-200"
            }`}
            onClick={props.onToggleRequirements}
            aria-label="Toggle requirements from requirements section"
            disabled={!props.uiState.joined}
          >
            {!props.uiState.joined
              ? "Join campaign to update requirement status"
              : props.uiState.requirementsCompleted
                ? "Mark requirements pending"
                : "Mark requirements complete"}
          </button>
        </SectionCard>
      </section>
    );
  }

  if (props.uiState.activeSection === "stream-content") {
    return (
      <section className="space-y-4" data-testid="streamer-section-stream-content">
        <div className="rounded-xl border border-emerald-300/35 bg-emerald-950/40 px-4 py-3 text-sm font-medium text-emerald-100">
          {props.data.streamContent.activationNotice}
        </div>

        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--streamer-muted)]">Message</p>
          <div className="mt-3 border-l-2 border-cyan-300 bg-white/[0.03] px-4 py-3">
            <p className="text-xl font-semibold text-white">{props.data.streamContent.messageTitle}</p>
            <p className="mt-2 text-base leading-relaxed text-slate-200">{props.data.streamContent.messageBody}</p>
          </div>
        </SectionCard>

        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--streamer-muted)]">Command</p>
          <div className="mt-3 border-l-2 border-cyan-300 bg-white/[0.03] px-4 py-3">
            <p className="text-xl font-semibold text-white">{props.data.streamContent.commandTitle}</p>
            <p className="mt-2 text-base leading-relaxed text-slate-200">{props.data.streamContent.commandBody}</p>
          </div>
        </SectionCard>

        <SectionCard>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--streamer-muted)]">Overlay</p>
          <h3 className="mt-2 text-lg font-semibold text-white">{props.data.streamContent.overlayPreviewTitle}</h3>

          <div className="mt-3 grid gap-4 md:grid-cols-[260px_minmax(0,1fr)]">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={props.data.streamContent.overlayPreviewImageUrl}
                alt={props.data.streamContent.overlayPreviewImageAlt}
                className="h-72 w-full rounded-xl border border-white/15 object-cover"
              />
            </div>

            <div className="space-y-4">
              <button
                type="button"
                className="rounded-xl border border-white/20 bg-slate-950/45 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={props.onToggleOverlay}
                aria-label="Toggle overlay from stream content section"
                disabled={!props.uiState.joined}
              >
                {!props.uiState.joined
                  ? "Join campaign to test overlay"
                  : props.uiState.overlayConnected
                    ? "Disconnect overlay"
                    : "Test on overlay"}
              </button>

              <div className="streamer-card-soft rounded-xl p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--streamer-muted)]">Title</p>
                <p className="mt-1 text-2xl font-semibold text-white">{props.data.streamContent.sampleTitle}</p>
              </div>

              <div className="streamer-card-soft rounded-xl p-3">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--streamer-muted)]">Overlay status</p>
                <p className={`mt-1 text-base font-semibold ${props.uiState.overlayConnected ? "text-emerald-200" : "text-rose-200"}`}>
                  {props.uiState.overlayConnected ? "Connected and receiving commands" : "Not connected"}
                </p>
              </div>
            </div>
          </div>
        </SectionCard>
      </section>
    );
  }

  return (
    <section className="space-y-4" data-testid="streamer-section-configuration">
      <SectionCard>
        <h2 className="text-3xl font-semibold text-white">Overlay position</h2>
        <div className="mt-3 rounded-lg border border-blue-300/30 bg-blue-950/35 px-4 py-3 text-sm text-blue-100">
          {props.data.configuration.guidance}
        </div>

        <div className="mt-4 rounded-2xl border border-white/20 bg-black/25 p-3">
          <div className="grid gap-3 sm:grid-cols-3">
            {props.data.configuration.slots.map((slot) => {
              const isSelected = props.uiState.selectedOverlaySlot === slot.id;

              return (
                <button
                  key={slot.id}
                  type="button"
                  data-testid={`overlay-slot-${slot.id}`}
                  className={`relative h-28 rounded-xl border-2 transition ${
                    isSelected
                      ? "border-blue-300 bg-blue-500/55 text-white shadow-[0_0_0_1px_rgba(125,211,252,0.6)]"
                      : "border-dashed border-white/25 bg-slate-900/40 text-slate-300 hover:border-white/45"
                  }`}
                  onClick={() => props.onSelectOverlaySlot(slot.id)}
                >
                  <span className="absolute left-2 top-2 rounded-full bg-black/40 px-2 py-1 text-xs">{slot.label}</span>
                  <span className="text-2xl font-semibold" aria-hidden="true">
                    {isSelected ? "o" : "+"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-300" data-testid="selected-overlay-slot">
          Selected position: <span className="font-semibold text-white">{selectedSlot?.label ?? "None"}</span>
        </p>
      </SectionCard>
    </section>
  );
}
