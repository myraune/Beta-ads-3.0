import { StatusPill } from "@/components/status-pill";
import type { ReactNode } from "react";
import { ROLE_BADGE_LABEL, type RoleTheme } from "@/lib/theme-tokens";

interface TopbarBadge {
  label: string;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
}

export interface AppTopbarProps {
  role: RoleTheme;
  title: string;
  subtitle?: string;
  badges?: TopbarBadge[];
  actions?: ReactNode;
}

export function AppTopbar({ role, title, subtitle, badges = [], actions }: AppTopbarProps) {
  return (
    <header className={`beta-app-topbar beta-glass-card beta-role-${role}`}>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="beta-topbar-kicker">{role} workspace</p>
          <span className="beta-topbar-role-chip">{ROLE_BADGE_LABEL[role]}</span>
        </div>
        <h1 className="beta-topbar-title">{title}</h1>
        {subtitle ? <p className="beta-topbar-subtitle">{subtitle}</p> : null}
        {badges.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <StatusPill key={badge.label} tone={badge.tone}>
                {badge.label}
              </StatusPill>
            ))}
          </div>
        ) : null}
      </div>
      {actions ? <div className="beta-topbar-actions">{actions}</div> : null}
    </header>
  );
}
