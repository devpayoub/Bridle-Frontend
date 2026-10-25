import Link from "next/link";

import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import type { UsageByAssistant } from "@/lib/api/types";

export function AssistantBreakdown({ data }: { data: UsageByAssistant }) {
  const rows = data.results.slice(0, 5);
  const max = Math.max(1, ...rows.map((row) => row.requests));

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base">Requests by assistant</CardTitle>
          <CardDescription>Volume this period, highest first.</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/usage">
            Details
            <ArrowRightIcon className="size-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <Empty className="border-none p-0">
            <EmptyHeader>
              <EmptyTitle>No traffic yet</EmptyTitle>
              <EmptyDescription>Once your assistant answers a request it will show up here.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/playground">Try the playground</Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-4">
            {rows.map((row) => (
              <li key={row.assistant_id} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-3">
                  <Link
                    href={`/dashboard/assistants/${row.assistant_id}`}
                    className="truncate font-medium text-sm underline-offset-4 hover:underline"
                  >
                    {row.assistant_name}
                  </Link>
                  <span className="text-muted-foreground text-sm tabular-nums">{row.requests.toLocaleString()}</span>
                </div>
                <Progress value={Math.round((row.requests / max) * 100)} className="h-1.5" />
                <div className="flex gap-3 text-muted-foreground text-xs">
                  <span>{row.successful.toLocaleString()} answered</span>
                  <span>{row.refused.toLocaleString()} refused</span>
                  <span>{row.average_latency_ms.toLocaleString()} ms avg</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
