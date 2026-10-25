import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { serverFetch } from "@/lib/api/server";
import type { Organization } from "@/lib/api/types";
import { formatDate } from "@/lib/format";
import { requireTenant } from "@/lib/tenant/server";

import { OrganizationForm } from "./_components/organization-form";

export const metadata: Metadata = {
  title: "Workspace settings",
};

export default async function GeneralSettingsPage() {
  const tenant = await requireTenant();
  const organization = await serverFetch<Organization>(`/organizations/${tenant.organizationId}/`);
  const canWrite = tenant.session.capabilities.includes("organization:write");

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>Identity and reporting boundaries for this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationForm organization={organization} canWrite={canWrite} />
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Plan</span>
            <Badge variant="outline" className="font-normal">
              {organization.plan_code ?? "No plan"}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Status</span>
            <Badge variant="outline" className="font-normal">
              {organization.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Members</span>
            <span className="font-medium tabular-nums">{organization.member_count}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Your role</span>
            <span className="font-medium">{organization.role ?? tenant.role}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Slug</span>
            <span className="font-mono text-xs">{organization.slug}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Created</span>
            <span className="font-medium tabular-nums">{formatDate(organization.created_at)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
