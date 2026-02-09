import { BUSINESS_CAMPAIGNS, BUSINESS_INVOICES } from "@/lib/business-mock";
import { StatusPill } from "@/components/status-pill";

function invoiceTone(status: string): "success" | "warning" | "danger" {
  if (status === "paid") {
    return "success";
  }

  if (status === "pending") {
    return "warning";
  }

  return "danger";
}

export function BusinessBilling() {
  const totalBudget = BUSINESS_CAMPAIGNS.reduce((sum, campaign) => sum + campaign.budget, 0);
  const totalSpend = BUSINESS_CAMPAIGNS.reduce((sum, campaign) => sum + campaign.spent, 0);
  const spendProgress = totalBudget > 0 ? Math.round((totalSpend / totalBudget) * 100) : 0;

  return (
    <div className="space-y-4">
      <section className="beta-panel">
        <h2 className="beta-panel-title">Budget control</h2>
        <p className="beta-panel-subtitle">Track spend against total approved campaign budgets.</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <article className="beta-kpi-card">
            <p className="beta-kpi-label">Total budget</p>
            <p className="beta-kpi-value">${totalBudget.toLocaleString("en-US")}</p>
          </article>
          <article className="beta-kpi-card">
            <p className="beta-kpi-label">Current spend</p>
            <p className="beta-kpi-value">${totalSpend.toLocaleString("en-US")}</p>
          </article>
          <article className="beta-kpi-card">
            <p className="beta-kpi-label">Utilization</p>
            <p className="beta-kpi-value">{spendProgress}%</p>
          </article>
        </div>

        <div className="mt-4 h-2 rounded-full bg-slate-900/80">
          <div className="h-2 rounded-full bg-gradient-to-r from-rose-500 to-cyan-400" style={{ width: `${spendProgress}%` }} />
        </div>
      </section>

      <section className="beta-panel">
        <h3 className="beta-panel-title">Invoices</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="beta-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Issued</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {BUSINESS_INVOICES.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.period}</td>
                  <td>
                    {invoice.currency} {invoice.amount.toLocaleString("en-US")}
                  </td>
                  <td>
                    <StatusPill tone={invoiceTone(invoice.status)}>{invoice.status}</StatusPill>
                  </td>
                  <td>{invoice.issuedAt}</td>
                  <td>{invoice.dueAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
