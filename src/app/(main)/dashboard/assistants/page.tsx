import Link from "next/link";

import { BotIcon, PlusIcon } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { PaginationBar } from "@/components/pagination-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { serverFetch } from "@/lib/api/server";
import type { Assistant, Paginated } from "@/lib/api/types";
import { requireTenant } from "@/lib/tenant/server";

import { AssistantsFilters } from "./_components/assistants-filters";
import { AssistantsTable } from "./_components/assistants-table";

export const metadata: Metadata = {
  title: "Assistants",
};

type SearchParams = { page?: string; status?: string; domain_type?: string; search?: string };

export default async function AssistantsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const tenant = await requireTenant();

  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const data = await serverFetch<Paginated<Assistant>>("/assistants/", {
    query: {
      page,
      status: params.status,
      domain_type: params.domain_type,
      search: params.search,
    },
  });

  const canWrite = tenant.session.capabilities.includes("assistant:write");
  const hasFilters = [params.status, params.domain_type, params.search].some(Boolean);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Assistants"
        description="Each assistant is bound to one domain, one set of approved sources and one policy."
        actions={
          canWrite ? (
            <Button asChild size="sm">
              <Link href="/dashboard/assistants/new">
                <PlusIcon className="size-4" />
                New assistant
              </Link>
            </Button>
          ) : null
        }
      />

      <AssistantsFilters initialSearch={params.search ?? ""} />

      <Card className="overflow-hidden py-0">
        <CardContent className="px-0">
          {data.results.length === 0 ? (
            <Empty className="border-none py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BotIcon />
                </EmptyMedia>
                <EmptyTitle>{hasFilters ? "No assistants match these filters" : "No assistants yet"}</EmptyTitle>
                <EmptyDescription>
                  {hasFilters
                    ? "Try clearing the filters to see everything in this workspace."
                    : "Create your first assistant, define the topics it may cover, then activate it."}
                </EmptyDescription>
              </EmptyHeader>
              {canWrite && !hasFilters ? (
                <EmptyContent>
                  <Button asChild size="sm">
                    <Link href="/dashboard/assistants/new">Create assistant</Link>
                  </Button>
                </EmptyContent>
              ) : null}
            </Empty>
          ) : (
            <AssistantsTable assistants={data.results} />
          )}
        </CardContent>
      </Card>

      <PaginationBar
        basePath="/dashboard/assistants"
        params={{ status: params.status, domain_type: params.domain_type, search: params.search }}
        page={data.page}
        count={data.count}
        pageSize={data.page_size}
      />
    </div>
  );
}
