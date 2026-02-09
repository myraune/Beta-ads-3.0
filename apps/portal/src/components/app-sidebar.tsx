import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { isActiveNavItem, type PlatformNavItem } from "@/lib/platform-nav";
import type { RoleTheme } from "@/lib/theme-tokens";

export interface AppSidebarProps {
  role: RoleTheme;
  items: PlatformNavItem[];
  activePath: string;
  footer?: ReactNode;
}

export function AppSidebar({ role, items, activePath, footer }: AppSidebarProps) {
  return (
    <aside className={`beta-app-sidebar beta-glass-card beta-role-${role}`}>
      <div className="beta-sidebar-brand">
        <Link href="/" className="inline-flex items-center gap-2" aria-label="Beta Ads home">
          <BrandLogo kind="horizontal" surface="dark" size="sm" className="streamer-brand-logo streamer-brand-logo--horizontal" />
        </Link>
      </div>

      <nav className="beta-sidebar-nav" aria-label={`${role} navigation`}>
        {items.map((item) => {
          const active = isActiveNavItem(activePath, item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`beta-nav-item ${active ? "beta-nav-item-active" : ""}`}
              data-testid={`nav-item-${item.id}`}
            >
              <span className="beta-nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="beta-nav-label">{item.label}</span>
              {item.badge ? <span className="beta-nav-badge">{item.badge}</span> : null}
            </Link>
          );
        })}
      </nav>

      {footer ? <div className="beta-sidebar-footer">{footer}</div> : null}
    </aside>
  );
}
