import { redirect } from "next/navigation";

import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { serverFetch } from "@/lib/api/server";
import type { MembershipRow, Paginated } from "@/lib/api/types";
import { requireTenant } from "@/lib/tenant/server";

import { AddMemberDialog } from "./_components/add-member-dialog";
import { MembersTable } from "./_components/members-table";

export const metadata: Metadata = {
  title: "Members",
};

export default async function MembersPage() {
  const tenant = await requireTenant();

  if (!tenant.session.capabilities.includes("member:read")) {
    redirect("/unauthorized");
  }

  const members = await serverFetch<Paginated<MembershipRow>>(`/organizations/${tenant.organizationId}/members/`, {
    query: { page_size: 100 },
  });

  const canWrite = tenant.session.capabilities.includes("member:write");

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Members"
        description={`Who can access ${tenant.organizationName}, and what each person is allowed to do.`}
        actions={canWrite ? <AddMemberDialog organizationId={tenant.organizationId} /> : null}
      />

      <Card className="overflow-hidden py-0">
        <CardContent className="px-0">
          <MembersTable
            members={members.results}
            organizationId={tenant.organizationId}
            canWrite={canWrite}
            actorRole={tenant.role}
            currentUserId={tenant.session.user.id}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>Capabilities are enforced by the API, not by the interface.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1 rounded-lg border p-3">
            <span className="font-medium">Read only</span>
            <span className="text-muted-foreground">View assistants, knowledge and conversations.</span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border p-3">
            <span className="font-medium">Member</span>
            <span className="text-muted-foreground">Adds usage visibility and playground access.</span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border p-3">
            <span className="font-medium">Developer</span>
            <span className="text-muted-foreground">Manages assistants, policies, knowledge and keys.</span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border p-3">
            <span className="font-medium">Admin</span>
            <span className="text-muted-foreground">Adds member management and the audit log.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
