import type { ReactNode } from "react";

import { cookies } from "next/headers";

import { cn } from "cn";
import { AlertTriangleIcon } from "lucide-react";

import { SessionProvider } from "@/components/session-provider";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { serverFetch } from "@/lib/api/server";
import type { UsageSummary } from "@/lib/api/types";
import { requireTenant } from "@/lib/tenant/server";
import { getPreference } from "@/server/server-actions";

import { LayoutControls } from "./_components/header/layout-controls";
import { OrgSwitcher } from "./_components/header/org-switcher";
import { SearchDialog } from "./_components/header/search-dialog";
import { ThemeSwitcher } from "./_components/header/theme-switcher";
import { AppSidebar } from "./_components/sidebar/app-sidebar";
import type { QuotaSnapshot } from "./_components/sidebar/quota-card";

async function loadQuota(): Promise<QuotaSnapshot | null> {
  try {
    const summary = await serverFetch<UsageSummary>("/usage/summary/");
    const chat = summary.quota.chat_requests;
    return { used: chat.used, limit: chat.limit, remaining: chat.remaining, periodEnd: chat.period_end };
  } catch {
    // Quota is informational: never block the shell on it.
    return null;
  }
}

export default async function Layout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  const [variant, collapsible, tenant] = await Promise.all([
    getPreference("sidebar_variant"),
    getPreference("sidebar_collapsible"),
    requireTenant(),
  ]);

  // Only fetch quota once a tenant is resolved (the request needs the org header).
  const quota = await loadQuota();

  const { session } = tenant;

  return (
    <SessionProvider
      value={{
        user: session.user,
        memberships: session.memberships,
        activeOrganizationId: session.activeOrganizationId,
        activeOrganization: session.activeOrganization,
        role: session.role,
        capabilities: session.capabilities,
      }}
    >
      <SidebarProvider
        defaultOpen={defaultOpen}
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 68)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant={variant} collapsible={collapsible} quota={quota} />
        <SidebarInset
          className={cn(
            "[html[data-content-layout=centered]_&>*]:mx-auto",
            "[html[data-content-layout=centered]_&>*]:w-full",
            "[html[data-content-layout=centered]_&>*]:max-w-screen-2xl",
            "peer-data-[variant=inset]:border",
            "[--dashboard-header-height:--spacing(12)]",
            "min-w-0 overflow-x-clip",
          )}
        >
          <header
            className={cn(
              "flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
              // Handle sticky navbar style with conditional classes so blur, background, z-index, and rounded corners remain consistent across all SidebarVariant layouts.
              "[html[data-navbar-style=sticky]_&]:sticky [html[data-navbar-style=sticky]_&]:top-0 [html[data-navbar-style=sticky]_&]:z-50 [html[data-navbar-style=sticky]_&]:overflow-hidden [html[data-navbar-style=sticky]_&]:rounded-t-[inherit] [html[data-navbar-style=sticky]_&]:bg-background/50 [html[data-navbar-style=sticky]_&]:backdrop-blur-md",
            )}
          >
            <div className="flex w-full items-center justify-between px-4 lg:px-6">
              <div className="flex items-center gap-1 lg:gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mx-2 data-[orientation=vertical]:h-4 data-[orientation=vertical]:self-center"
                />
                <SearchDialog />
              </div>
              <div className="flex items-center gap-2">
                <LayoutControls />
                <ThemeSwitcher />
                <OrgSwitcher />
              </div>
            </div>
          </header>

          {!session.user.is_email_verified ? (
            <div className="flex items-start gap-2 border-b bg-amber-500/10 px-4 py-2 text-amber-900 text-sm lg:px-6 dark:text-amber-200">
              <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
              <p>
                Your email is not verified yet. Some features stay limited until you confirm it — you can resend the
                link from{" "}
                <a href="/dashboard/settings/account" className="font-medium underline underline-offset-4">
                  account settings
                </a>
                .
              </p>
            </div>
          ) : null}

          {/* Pages can set data-content-padding="false" to render full-bleed app layouts. */}
          <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden p-4 has-data-[content-padding=false]:p-0 md:p-6 md:has-data-[content-padding=false]:p-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  );
}
