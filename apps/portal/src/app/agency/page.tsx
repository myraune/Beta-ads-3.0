import Link from "next/link";
import { BusinessDashboard } from "@/components/business-dashboard";

export default function AgencyCompatibilityPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-8">
      <div className="beta-panel mb-4">
        <h1 className="beta-panel-title">Agency route compatibility</h1>
        <p className="beta-panel-subtitle">This route is retained for backwards compatibility. Canonical route is /business.</p>
        <Link href="/business" className="beta-btn-primary mt-3 inline-flex">
          Open canonical business route
        </Link>
      </div>
      <BusinessDashboard />
    </main>
  );
}
