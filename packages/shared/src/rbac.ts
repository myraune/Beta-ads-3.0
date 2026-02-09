import type { Role } from "./enums";

export const PERMISSIONS = {
  auth: ["request_magic_link", "verify_magic_link", "logout"],
  users: ["read_me"],
  streamers: ["upsert_profile", "read_profile", "create_channel", "read_channels", "rotate_overlay_key"],
  campaigns: ["create", "read", "read_one", "create_flight", "assign_streamers"],
  creatives: ["upload", "read"],
  deliveries: ["trigger"],
  events: ["ingest"],
  reports: ["summary", "export_csv", "export_pdf"],
  payouts: ["run", "mark_paid"],
  admin: ["audit"]
} as const;

export type Resource = keyof typeof PERMISSIONS;
export type Permission<R extends Resource = Resource> = `${R}:${(typeof PERMISSIONS)[R][number]}`;

export const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    "users:read_me",
    "streamers:upsert_profile",
    "streamers:read_profile",
    "streamers:create_channel",
    "streamers:read_channels",
    "streamers:rotate_overlay_key",
    "campaigns:create",
    "campaigns:read",
    "campaigns:read_one",
    "campaigns:create_flight",
    "campaigns:assign_streamers",
    "creatives:upload",
    "creatives:read",
    "deliveries:trigger",
    "events:ingest",
    "reports:summary",
    "reports:export_csv",
    "reports:export_pdf",
    "payouts:run",
    "payouts:mark_paid",
    "admin:audit"
  ],
  agency: [
    "users:read_me",
    "campaigns:create",
    "campaigns:read",
    "campaigns:read_one",
    "campaigns:create_flight",
    "campaigns:assign_streamers",
    "creatives:upload",
    "creatives:read",
    "deliveries:trigger",
    "reports:summary",
    "reports:export_csv",
    "reports:export_pdf",
    "payouts:run"
  ],
  brand: [
    "users:read_me",
    "campaigns:read",
    "campaigns:read_one",
    "creatives:read",
    "reports:summary",
    "reports:export_csv",
    "reports:export_pdf"
  ],
  streamer: [
    "users:read_me",
    "streamers:upsert_profile",
    "streamers:read_profile",
    "streamers:create_channel",
    "streamers:read_channels",
    "streamers:rotate_overlay_key",
    "reports:summary"
  ],
  viewer: ["users:read_me"]
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}
