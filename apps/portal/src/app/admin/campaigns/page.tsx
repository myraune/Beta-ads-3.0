import { StatusPill } from "@/components/status-pill";
import { ADMIN_CAMPAIGN_REVIEW_QUEUE } from "@/lib/admin-mock";

export default function AdminCampaignsPage() {
  return (
    <section className="beta-panel">
      <h2 className="beta-panel-title">Campaign review queue</h2>
      <p className="beta-panel-subtitle">Approve or reject submitted campaigns after policy and creative checks.</p>
      <div className="mt-3 overflow-x-auto">
        <table className="beta-table">
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Advertiser</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Risk flags</th>
            </tr>
          </thead>
          <tbody>
            {ADMIN_CAMPAIGN_REVIEW_QUEUE.map((row) => (
              <tr key={row.id}>
                <td>{row.campaignName}</td>
                <td>{row.advertiser}</td>
                <td>{row.submittedAt}</td>
                <td>
                  <StatusPill tone={row.status === "approved" ? "success" : row.status === "rejected" ? "danger" : "warning"}>{row.status}</StatusPill>
                </td>
                <td>{row.riskFlags.length > 0 ? row.riskFlags.join(", ") : "None"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
