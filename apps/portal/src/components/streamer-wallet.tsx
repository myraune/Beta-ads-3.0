import { STREAMER_WALLET_DATA } from "@/lib/streamer-mock";
import { StatusPill } from "@/components/status-pill";

function payoutTone(status: string): "success" | "warning" | "info" {
  if (status === "paid") {
    return "success";
  }

  if (status === "processing") {
    return "info";
  }

  return "warning";
}

export function StreamerWallet() {
  return (
    <main className="space-y-4">
      <section className="streamer-card rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.22em] text-[var(--streamer-muted)]">Wallet</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Earnings and payouts</h2>
        <p className="mt-2 text-sm text-slate-300">Track earnings, threshold progress, and payout settlement status.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {STREAMER_WALLET_DATA.stats.map((stat) => (
            <article key={stat.label} className="streamer-card-soft rounded-xl p-3">
              <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--streamer-muted)]">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-400">{stat.helper}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="streamer-card rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold text-white">Payout threshold</h3>
          <button type="button" className="streamer-primary-btn rounded-lg px-4 py-2 text-sm font-semibold text-white transition">
            Request payout
          </button>
        </div>
        <div className="mt-3 h-2 rounded-full bg-slate-900/70">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
            style={{ width: `${STREAMER_WALLET_DATA.thresholdProgressPercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-300">{STREAMER_WALLET_DATA.thresholdLabel}</p>
      </section>

      <section className="streamer-card rounded-2xl p-5">
        <h3 className="text-xl font-semibold text-white">Payout history</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="beta-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Campaign</th>
                <th>Gross</th>
                <th>Withholding</th>
                <th>Net</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {STREAMER_WALLET_DATA.payouts.map((payout) => (
                <tr key={payout.id}>
                  <td>{payout.date}</td>
                  <td>{payout.campaign}</td>
                  <td>{payout.gross}</td>
                  <td>{payout.withholding}</td>
                  <td>{payout.net}</td>
                  <td>
                    <StatusPill tone={payoutTone(payout.status)}>{payout.status}</StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
