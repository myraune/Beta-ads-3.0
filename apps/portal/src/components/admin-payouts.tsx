"use client";

import { useState } from "react";
import { StatusPill } from "@/components/status-pill";
import { ADMIN_PAYOUTS } from "@/lib/admin-mock";

export function AdminPayouts() {
  const [rows, setRows] = useState(ADMIN_PAYOUTS);

  return (
    <section className="beta-panel">
      <h2 className="beta-panel-title">Payout queue</h2>
      <p className="beta-panel-subtitle">Manual settlement controls for MVP payout operations.</p>
      <div className="mt-3 overflow-x-auto">
        <table className="beta-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Campaign</th>
              <th>Streamer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.campaignName}</td>
                <td>{row.streamerHandle}</td>
                <td>
                  {row.currency} {row.amount}
                </td>
                <td>
                  <StatusPill tone={row.status === "paid" ? "success" : row.status === "processing" ? "info" : "warning"}>{row.status}</StatusPill>
                </td>
                <td>
                  <button
                    type="button"
                    className="beta-btn-ghost"
                    disabled={row.status === "paid"}
                    onClick={() =>
                      setRows((previous) =>
                        previous.map((item) => (item.id === row.id ? { ...item, status: "paid" } : item))
                      )
                    }
                  >
                    Mark paid
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
