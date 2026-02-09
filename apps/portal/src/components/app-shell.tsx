import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar, type AppTopbarProps } from "@/components/app-topbar";
import type { ReactNode } from "react";
import type { PlatformNavItem } from "@/lib/platform-nav";
import type { RoleTheme } from "@/lib/theme-tokens";

export interface AppShellProps {
  role: RoleTheme;
  navItems: PlatformNavItem[];
  activePath: string;
  topbar: Omit<AppTopbarProps, "role">;
  sidebarFooter?: ReactNode;
  rightRail?: ReactNode;
  children: ReactNode;
}

export function AppShell({ role, navItems, activePath, topbar, sidebarFooter, rightRail, children }: AppShellProps) {
  return (
    <main className={`beta-app-shell beta-role-${role}`}>
      <AppSidebar role={role} items={navItems} activePath={activePath} footer={sidebarFooter} />
      <div className="beta-app-main">
        <AppTopbar role={role} {...topbar} />
        <div className={`beta-app-content ${rightRail ? "beta-app-content-with-rail" : ""}`}>
          <section className="space-y-4">{children}</section>
          {rightRail ? <aside className="space-y-4">{rightRail}</aside> : null}
        </div>
      </div>
    </main>
  );
}
