import { redirect } from "next/navigation";

import { GaugeIcon } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UsageRange } from "@/components/usage-range";
import { serverFetch } from "@/lib/api/server";
import type { QuotaState, UsageByApiKey, UsageByAssistant, UsageSummary } from "@/lib/api/types";
import { formatDate, formatNumber } from "@/lib/format";
import { requireTenant } from "@/lib/tenant/server";

import { UsageByAssistantChart } from "./_components/usage-chart";

export const metadata: Metadata = {
  title: "Usage",
};

function quotaPercent(quota: QuotaState): number {
  if (!quota.limit) return 0;
  return Math.min(100, Math.round((quota.used / quota.limit) * 100));
}

function QuotaRow({ label, quota }: { label: string; quota: QuotaState }) {
  const percent = quotaPercent(quota);
  const critical = percent >= 90;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground tabular-nums">
          {formatNumber(quota.used)} / {formatNumber(quota.limit)}
        </span>
      </div>
      <Progress
        value={percent}
        className={critical ? "[&>[data-slot=progress-indicator]]:bg-destructive" : undefined}
      />
      <div className="flex items-center justify-between text-muted-foreground text-xs">
        <span>{percent}% used</span>
        <span>Resets {formatDate(quota.period_end)}</span>
      </div>
    </div>
  );
}

export default async function UsagePage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const params = await searchParams;
  const tenant = await requireTenant();

  if (!tenant.session.capabilities.includes("usage:read")) {
    redirect("/unauthorized");
  }

  const range = { from: params.from, to: params.to };
  const [summary, byAssistant, byApiKey] = await Promise.all([
    serverFetch<UsageSummary>("/usage/summary/", { query: range }),
    serverFetch<UsageByAssistant>("/usage/by-assistant/", { query: range }),
    serverFetch<UsageByApiKey>("/usage/by-api-key/", { query: range }),
  ]);

  const totals = summary.totals;
  const answeredRate = totals.requests ? Math.round((totals.successful / totals.requests) * 100) : 0;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Usage"
        description={`Billing period ${formatDate(summary.from)} – ${formatDate(summary.to)}. ${summary.note}`}
      />

      <UsageRange />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1 rounded-lg border p-3">
          <span className="text-muted-foreground text-xs">Requests</span>
          <span className="font-semibold text-2xl tabular-nums">{formatNumber(totals.requests)}</span>
          <span className="text-muted-foreground text-xs">{answeredRate}% answered</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border p-3">
          <span className="text-muted-foreground text-xs">Refused</span>
          <span className="font-semibold text-2xl tabular-nums">{formatNumber(totals.refused)}</span>
          <span className="text-muted-foreground text-xs">Blocked by policy</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border p-3">
          <span className="text-muted-foreground text-xs">Tokens</span>
          <span className="font-semibold text-2xl tabular-nums">
            {formatNumber(totals.input_tokens + totals.output_tokens)}
          </span>
          <span className="text-muted-foreground text-xs">Estimated</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border p-3">
          <span className="text-muted-foreground text-xs">Average latency</span>
          <span className="font-semibold text-2xl tabular-nums">
            {formatNumber(Math.round(totals.average_latency_ms))} ms
          </span>
          <span className="text-muted-foreground text-xs">{formatNumber(totals.errors)} errors</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quota</CardTitle>
            <CardDescription>Hard limits for the current plan.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <QuotaRow label="Chat requests" quota={summary.quota.chat_requests} />
            <QuotaRow label="Policy evaluations" quota={summary.quota.policy_evaluations} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requests by assistant</CardTitle>
            <CardDescription>Answered versus refused in this period.</CardDescription>
          </CardHeader>
          <CardContent>
            <UsageByAssistantChart data={byAssistant.results} />
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden py-0">
        <CardHeader className="pt-4">
          <CardTitle>By assistant</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Assistant</TableHead>
                <TableHead className="text-right">Requests</TableHead>
                <TableHead className="text-right">Answered</TableHead>
                <TableHead className="text-right">Refused</TableHead>
                <TableHead className="text-right">Tokens</TableHead>
                <TableHead className="pr-4 text-right">Latency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byAssistant.results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground text-sm">
                    No traffic recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                byAssistant.results.map((row) => (
                  <TableRow key={row.assistant_id}>
                    <TableCell className="pl-4 font-medium">{row.assistant_name}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(row.requests)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(row.successful)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(row.refused)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(row.input_tokens + row.output_tokens)}
                    </TableCell>
                    <TableCell className="pr-4 text-right text-muted-foreground tabular-nums">
                      {formatNumber(Math.round(row.average_latency_ms))} ms
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="overflow-hidden py-0">
        <CardHeader className="pt-4">
          <CardTitle>By API key</CardTitle>
          <CardDescription>Server-to-server traffic only.</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Key</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead className="text-right">Requests</TableHead>
                <TableHead className="text-right">Refused</TableHead>
                <TableHead className="pr-4 text-right">Errors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byApiKey.results.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground text-sm">
                    <span className="inline-flex items-center gap-1.5">
                      <GaugeIcon className="size-4" />
                      No API key traffic in this period.
                    </span>
                  </TableCell>
                </TableRow>
              ) : (
                byApiKey.results.map((row) => (
                  <TableRow key={row.api_key_id}>
                    <TableCell className="pl-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium">{row.name}</span>
                        <span className="font-mono text-muted-foreground text-xs">{row.prefix}…</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {row.environment}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(row.requests)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatNumber(row.refused)}</TableCell>
                    <TableCell className="pr-4 text-right tabular-nums">{formatNumber(row.errors)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
