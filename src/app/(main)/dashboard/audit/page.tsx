import { redirect } from "next/navigation";

import { ScrollTextIcon } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { PaginationBar } from "@/components/pagination-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { serverFetch } from "@/lib/api/server";
import type { AuditLog, Paginated } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";
import { requireTenant } from "@/lib/tenant/server";

import { AUDIT_ACTION_LABELS } from "./_components/action-labels";
import { AuditFilters } from "./_components/audit-filters";

export const metadata: Metadata = {
  title: "Audit log",
};

type SearchParams = { page?: string; action?: string; target_type?: string; target_id?: string };

export default async function AuditPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const tenant = await requireTenant();

  if (!tenant.session.capabilities.includes("audit:read")) {
    redirect("/unauthorized");
  }

  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const data = await serverFetch<Paginated<AuditLog>>("/audit-logs/", {
    query: { page, action: params.action, target_type: params.target_type, target_id: params.target_id },
  });

  const hasFilters = [params.action, params.target_type, params.target_id].some(Boolean);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Audit log"
        description="Every state change in this workspace, with the actor and the request that caused it."
      />

      <AuditFilters />

      <Card className="overflow-hidden py-0">
        <CardContent className="px-0">
          {data.results.length === 0 ? (
            <Empty className="border-none py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ScrollTextIcon />
                </EmptyMedia>
                <EmptyTitle>{hasFilters ? "No events match these filters" : "No events yet"}</EmptyTitle>
                <EmptyDescription>
                  {hasFilters
                    ? "Try clearing the filters to see the full history."
                    : "Creating an assistant, rotating a key or changing a role all land here."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Event</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Request</TableHead>
                  <TableHead className="pr-4">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.results.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="pl-4">
                      <span className="font-medium">{AUDIT_ACTION_LABELS[entry.action] ?? entry.action}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {entry.actor_email ?? (entry.api_key_prefix ? `${entry.api_key_prefix}…` : "System")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <Badge variant="outline" className="w-fit font-normal">
                          {entry.target_type || "—"}
                        </Badge>
                        {entry.target_id ? (
                          <span className="font-mono text-muted-foreground text-xs">
                            {entry.target_id.slice(0, 8)}…
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground text-xs">
                      {entry.request_id ? `${entry.request_id.slice(0, 8)}…` : "—"}
                    </TableCell>
                    <TableCell className="pr-4 text-muted-foreground text-sm tabular-nums">
                      {formatDateTime(entry.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PaginationBar
        basePath="/dashboard/audit"
        params={{ action: params.action, target_type: params.target_type, target_id: params.target_id }}
        page={data.page}
        count={data.count}
        pageSize={data.page_size}
      />
    </div>
  );
}
