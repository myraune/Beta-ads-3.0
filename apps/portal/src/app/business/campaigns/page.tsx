import Link from "next/link";
import { StatusPill } from "@/components/status-pill";
import { BUSINESS_CAMPAIGNS } from "@/lib/business-mock";

function tone(status: string): "success" | "warning" | "danger" | "info" | "neutral" {
  if (status === "live" || status === "approved") {
    return "success";
  }

  if (status === "submitted") {
    return "warning";
  }

  if (status === "rejected") {
    return "danger";
  }

  if (status === "draft") {
    return "info";
  }

  return "neutral";
}

export default function BusinessCampaignsPage() {
  return (
    <div className="space-y-4">
      <section className="beta-panel">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="beta-panel-title">Campaign list</h2>
            <p className="beta-panel-subtitle">Current campaign states and assignment summary.</p>
          </div>
          <Link href="/business/campaigns/new" className="beta-btn-primary">
            New campaign
          </Link>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="beta-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Budget</th>
                <th>Spent</th>
                <th>Dates</th>
                <th>Streamers</th>
                <th>Open</th>
              </tr>
            </thead>
            <tbody>
              {BUSINESS_CAMPAIGNS.map((campaign) => (
                <tr key={campaign.id}>
                  <td>
                    <p className="font-semibold">{campaign.name}</p>
                    <p className="text-xs text-slate-400">{campaign.advertiser}</p>
                  </td>
                  <td>
                    <StatusPill tone={tone(campaign.status)}>{campaign.status}</StatusPill>
                  </td>
                  <td>
                    {campaign.currency} {campaign.budget.toLocaleString("en-US")}
                  </td>
                  <td>
                    {campaign.currency} {campaign.spent.toLocaleString("en-US")}
                  </td>
                  <td>
                    {campaign.startDate} to {campaign.endDate}
                  </td>
                  <td>{campaign.assignedStreamers}</td>
                  <td>
                    <Link href={`/business/campaigns/${campaign.id}`} className="beta-btn-ghost inline-flex">
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
