import { StatusPill } from "@/components/status-pill";
import { ADMIN_STREAMER_RISKS } from "@/lib/admin-mock";

export default function AdminStreamersPage() {
  return (
    <section className="beta-panel">
      <h2 className="beta-panel-title">Streamer quality and risk</h2>
      <p className="beta-panel-subtitle">Monitor overlay reliability and requirement compliance risk signals.</p>
      <div className="mt-3 overflow-x-auto">
        <table className="beta-table">
          <thead>
            <tr>
              <th>Handle</th>
              <th>Score</th>
              <th>Flags</th>
              <th>Last updated</th>
            </tr>
          </thead>
          <tbody>
            {ADMIN_STREAMER_RISKS.map((streamer) => (
              <tr key={streamer.streamerId}>
                <td>{streamer.handle}</td>
                <td>
                  <StatusPill tone={streamer.score >= 85 ? "success" : streamer.score >= 70 ? "warning" : "danger"}>
                    {streamer.score}
                  </StatusPill>
                </td>
                <td>{streamer.flags.join(", ")}</td>
                <td>{streamer.lastUpdated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
