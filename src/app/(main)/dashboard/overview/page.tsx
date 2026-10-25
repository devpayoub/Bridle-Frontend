import Link from "next/link";

import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { UsageRange } from "@/components/usage-range";
import { serverFetchOrNull } from "@/lib/api/server";
import type { Conversation, Paginated, UsageByAssistant, UsageSummary } from "@/lib/api/types";
import { requireTenant } from "@/lib/tenant/server";

import { AssistantBreakdown } from "./_components/assistant-breakdown";
import { type Kpi, KpiCards } from "./_components/kpi-cards";
import { QuotaPanel } from "./_components/quota-panel";
import { RecentConversations } from "./_components/recent-conversations";

export const metadata: Metadata = {
  title: "Overview",
};

function percent(part: number, total: number): string {
  if (!total) return "—";
  return `${Math.round((part / total) * 100)}%`;
}

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const tenant = await requireTenant();

  const range = { from: params.from, to: params.to };
  const [summary, byAssistant, conversations] = await Promise.all([
    serverFetchOrNull<UsageSummary>("/usage/summary/", { query: range }),
    serverFetchOrNull<UsageByAssistant>("/usage/by-assistant/", { query: range }),
    serverFetchOrNull<Paginated<Conversation>>("/conversations/", { query: { page_size: 5 } }),
  ]);

  const totals = summary?.totals;
  const kpis: Kpi[] = [
    {
      label: "Chat requests",
      value: (totals?.requests ?? 0).toLocaleString(),
      hint: totals ? `${totals.successful.toLocaleString()} answered` : "No usage this period",
      trend: "flat",
    },
    {
      label: "Answer rate",
      value: totals ? percent(totals.successful, totals.requests) : "—",
      hint: totals ? `${totals.refused.toLocaleString()} refused by policy` : "Waiting for traffic",
      trend: "flat",
    },
    {
      label: "Clarifications",
      value: (totals?.clarifications ?? 0).toLocaleString(),
      hint: totals ? `${totals.escalations.toLocaleString()} escalated` : "—",
      trend: "flat",
    },
    {
      label: "Average latency",
      value: totals ? `${Math.round(totals.average_latency_ms).toLocaleString()} ms` : "—",
      hint: totals ? `${(totals.input_tokens + totals.output_tokens).toLocaleString()} tokens` : "—",
      trend: "flat",
    },
  ];

  const canCreateAssistant = tenant.session.capabilities.includes("assistant:write");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome back, ${tenant.session.user.full_name.split(" ")[0] || "there"}`}
        description={`${tenant.organizationName} · ${params.from ? "custom range" : "current billing period"}.`}
        actions={
          <div className="flex flex-wrap items-end gap-2">
            <UsageRange basePath="/dashboard/overview" />
            {canCreateAssistant ? (
              <Button asChild size="sm">
                <Link href="/dashboard/assistants/new">
                  <PlusIcon className="size-4" />
                  New assistant
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <KpiCards items={kpis} />

      <div className="grid gap-4 @container/main @[900px]/main:grid-cols-2">
        {summary ? (
          <QuotaPanel chat={summary.quota.chat_requests} policy={summary.quota.policy_evaluations} planCode={null} />
        ) : null}
        {byAssistant ? <AssistantBreakdown data={byAssistant} /> : null}
      </div>

      {conversations ? <RecentConversations data={conversations} /> : null}
    </div>
  );
}
