export type RoleTheme = "streamer" | "business" | "admin";

export const ROLE_ACCENT_CLASS: Record<RoleTheme, string> = {
  streamer: "text-cyan-200",
  business: "text-rose-200",
  admin: "text-amber-200"
};

export const ROLE_SURFACE_CLASS: Record<RoleTheme, string> = {
  streamer: "beta-role-streamer",
  business: "beta-role-business",
  admin: "beta-role-admin"
};

export const ROLE_BADGE_LABEL: Record<RoleTheme, string> = {
  streamer: "Streamer platform",
  business: "Business platform",
  admin: "Admin platform"
};
