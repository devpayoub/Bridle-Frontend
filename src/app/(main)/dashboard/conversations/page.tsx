import Link from "next/link";

import { ChevronRightIcon, MessagesSquareIcon } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { PaginationBar } from "@/components/pagination-bar";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { serverFetch, serverFetchOrNull } from "@/lib/api/server";
import type { Assistant, Conversation, Paginated } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";
import { requireTenant } from "@/lib/tenant/server";

import { ConversationFilters } from "./_components/conversation-filters";

export const metadata: Metadata = {
  title: "Conversations",
};

type SearchParams = { page?: string; assistant_id?: string; status?: string };

export default async function ConversationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  await requireTenant();

  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const [data, assistants] = await Promise.all([
    serverFetch<Paginated<Conversation>>("/conversations/", {
      query: { page, assistant_id: params.assistant_id, status: params.status },
    }),
    serverFetchOrNull<Paginated<Assistant>>("/assistants/", { query: { page_size: 100 } }),
  ]);

  const hasFilters = [params.assistant_id, params.status].some(Boolean);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Conversations"
        description="Every interaction the platform served, with the policy decision that produced it."
      />

      <ConversationFilters assistants={assistants?.results ?? []} />

      <Card className="overflow-hidden py-0">
        <CardContent className="px-0">
          {data.results.length === 0 ? (
            <Empty className="border-none py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessagesSquareIcon />
                </EmptyMedia>
                <EmptyTitle>{hasFilters ? "No conversations match these filters" : "No conversations yet"}</EmptyTitle>
                <EmptyDescription>
                  {hasFilters
                    ? "Try clearing the filters to see everything in this workspace."
                    : "Traffic appears here once an application calls the chat completions endpoint."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Assistant</TableHead>
                  <TableHead>External user</TableHead>
                  <TableHead className="text-right">Messages</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last activity</TableHead>
                  <TableHead className="pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.results.map((conversation) => (
                  <TableRow key={conversation.id} className="group">
                    <TableCell className="pl-4">
                      <Link
                        href={`/dashboard/conversations/${conversation.id}`}
                        className="font-medium underline-offset-4 group-hover:underline"
                      >
                        {conversation.assistant_name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {conversation.external_user_id || "Anonymous"}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">{conversation.message_count}</TableCell>
                    <TableCell>
                      <StatusBadge status={conversation.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm tabular-nums">
                      {formatDateTime(conversation.last_message_at ?? conversation.created_at)}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Link
                        href={`/dashboard/conversations/${conversation.id}`}
                        aria-label="Open conversation"
                        className="inline-flex text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <ChevronRightIcon className="size-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PaginationBar
        basePath="/dashboard/conversations"
        params={{ assistant_id: params.assistant_id, status: params.status }}
        page={data.page}
        count={data.count}
        pageSize={data.page_size}
      />
    </div>
  );
}
