import Link from "next/link";

import { ArrowRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Conversation, Paginated } from "@/lib/api/types";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export function RecentConversations({ data }: { data: Paginated<Conversation> }) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base">Recent conversations</CardTitle>
          <CardDescription>Latest activity across every assistant.</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/conversations">
            All conversations
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        {data.results.length === 0 ? (
          <Empty className="border-none">
            <EmptyHeader>
              <EmptyTitle>No conversations yet</EmptyTitle>
              <EmptyDescription>Conversations appear here as soon as your assistant is used.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/playground">Open the playground</Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Assistant</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Last activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.results.map((conversation) => (
                <TableRow key={conversation.id}>
                  <TableCell className="pl-6">
                    <Link
                      href={`/dashboard/conversations/${conversation.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {conversation.assistant_name}
                    </Link>
                  </TableCell>
                  <TableCell className="tabular-nums">{conversation.message_count}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {conversation.status.toLowerCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right text-muted-foreground tabular-nums">
                    {formatDate(conversation.last_message_at ?? conversation.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
