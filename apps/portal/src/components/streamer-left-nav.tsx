import type { StreamerLeftNavProps, StreamerSection } from "@/types/streamer";

const SECTION_ITEMS: Array<{ id: StreamerSection; label: string; short: string }> = [
  { id: "general", label: "General", short: "G" },
  { id: "brief", label: "Brief", short: "B" },
  { id: "requirements", label: "Requirements", short: "R" },
  { id: "stream-content", label: "Stream content", short: "S" },
  { id: "configuration", label: "Configuration", short: "C" }
];

export function StreamerLeftNav(props: StreamerLeftNavProps) {
  return (
    <aside
      className="streamer-card order-1 flex h-full flex-col rounded-2xl p-3 xl:min-h-[calc(100vh-3.5rem)]"
      data-testid="streamer-left-nav"
    >
      <header className="mb-4 border-b border-white/10 px-2 pb-4">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--streamer-muted)]">Campaign workspace</p>
        <div className="streamer-pill mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-slate-100">
          <span className="h-2 w-2 rounded-full bg-[var(--streamer-accent)]" aria-hidden="true" />
          ID {props.campaignId}
        </div>
        <h1 className="mt-3 text-lg font-semibold leading-tight text-white">{props.campaignTitle}</h1>
      </header>

      <nav className="space-y-2">
        {SECTION_ITEMS.map((item, index) => {
          const isActive = props.activeSection === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border px-3 py-2 text-left text-sm font-semibold tracking-wide transition ${
                isActive
                  ? "border-blue-300/40 bg-blue-500/20 text-white shadow-[inset_0_0_0_1px_rgba(147,197,253,0.6)]"
                  : "border-white/15 bg-slate-950/45 text-slate-200 hover:border-white/30 hover:bg-slate-900/80"
              }`}
              onClick={() => props.onSelect(item.id)}
              aria-pressed={isActive}
            >
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold ${
                  isActive
                    ? "border-blue-200/70 bg-blue-500/25 text-blue-100"
                    : "border-white/20 bg-black/25 text-slate-300 group-hover:text-white"
                }`}
                aria-hidden="true"
              >
                {item.short}
              </span>
              <span>{item.label}</span>
              <span className="ml-auto text-[10px] text-slate-500">0{index + 1}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-4">
        <button
          type="button"
          className="w-full rounded-xl border border-white/15 bg-slate-950/40 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-white/35"
        >
          Close workspace
        </button>
      </div>
    </aside>
  );
}
