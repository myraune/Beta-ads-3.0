import { BUSINESS_REPORT_ROWS } from "@/lib/business-mock";

export function BusinessReports() {
  return (
    <div className="space-y-4">
      <section className="beta-panel">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="beta-panel-title">Campaign reports</h2>
            <p className="beta-panel-subtitle">Proof of delivery summary by campaign.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="beta-btn-ghost">
              Export CSV
            </button>
            <button type="button" className="beta-btn-primary">
              Export PDF
            </button>
          </div>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="beta-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Streamers</th>
                <th>Impressions</th>
                <th>Clicks</th>
                <th>CTR</th>
                <th>Minutes on screen</th>
              </tr>
            </thead>
            <tbody>
              {BUSINESS_REPORT_ROWS.map((row) => (
                <tr key={row.campaignId}>
                  <td>{row.campaignName}</td>
                  <td>{row.streamerCount}</td>
                  <td>{row.impressions.toLocaleString("en-US")}</td>
                  <td>{row.clicks.toLocaleString("en-US")}</td>
                  <td>{row.ctr.toFixed(2)}%</td>
                  <td>{row.minutesOnScreen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
