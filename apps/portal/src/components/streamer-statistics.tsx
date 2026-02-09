import { STREAMER_STATISTICS_DATA } from "@/lib/streamer-mock";

export function StreamerStatistics() {
  return (
    <main className="space-y-4">
      <section className="streamer-card rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--streamer-muted)]">Statistics</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Delivery performance</h2>
        <p className="mt-2 text-sm text-slate-300">The last 30 days of activity from overlay and click events.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {STREAMER_STATISTICS_DATA.cards.map((card) => (
            <article key={card.id} className="streamer-card-soft rounded-xl p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--streamer-muted)]">{card.title}</p>
              <p className="mt-2 text-3xl font-semibold text-white">{card.value}</p>
              <p className="mt-1 text-xs text-slate-400">{card.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="streamer-card rounded-2xl p-5">
        <h3 className="text-xl font-semibold text-white">Daily trend</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="beta-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Impressions</th>
                <th>Clicks</th>
                <th>CTR</th>
                <th>Minutes on screen</th>
              </tr>
            </thead>
            <tbody>
              {STREAMER_STATISTICS_DATA.rows.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td>{row.impressions}</td>
                  <td>{row.clicks}</td>
                  <td>{row.ctr}</td>
                  <td>{row.minutesOnScreen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
