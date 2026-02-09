const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function request<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchCampaigns() {
  return request<Array<{ id: string; name: string; status: string; advertiser: string }>>("/campaigns");
}

export async function fetchAudit() {
  return request<Array<{ id: string; action: string; entityType: string; createdAt: string }>>("/admin/audit?limit=8");
}
