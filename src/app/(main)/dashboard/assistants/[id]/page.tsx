import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeftIcon, BookOpenIcon, ExternalLinkIcon } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiError } from "@/lib/api/errors";
import { serverFetch, serverFetchOrNull } from "@/lib/api/server";
import type { AISettings, Assistant, AssistantPolicy, AssistantUsage, KnowledgeBase, Paginated } from "@/lib/api/types";
import { formatDateTime, formatNumber } from "@/lib/format";
import { requireTenant } from "@/lib/tenant/server";

import { AssistantActions } from "../_components/assistant-actions";
import { AssistantEvaluations } from "../_components/assistant-evaluations";
import { AssistantForm } from "../_components/assistant-form";
import { AssistantPolicyForm } from "../_components/assistant-policy-form";

const DOMAIN_LABELS: Record<string, string> = {
  HOTEL: "Hotel",
  HOSPITAL: "Hospital",
  ECOMMERCE: "E-commerce",
  BOOKING: "Booking",
  UNIVERSITY: "University",
  GENERIC: "Generic",
  OTHER: "Other",
};

function TopicList({ topics, empty }: { topics: string[]; empty: string }) {
  if (topics.length === 0) return <p className="text-muted-foreground text-sm">{empty}</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {topics.map((topic) => (
        <Badge key={topic} variant="secondary" className="font-normal">
          {topic}
        </Badge>
      ))}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border p-3">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-semibold text-lg tabular-nums">{value}</span>
      {hint ? <span className="text-muted-foreground text-xs">{hint}</span> : null}
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const assistant = await serverFetch<Assistant>(`/assistants/${id}/`);
    return { title: assistant.name };
  } catch {
    return { title: "Assistant" };
  }
}

export default async function AssistantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await requireTenant();

  let assistant: Assistant;
  try {
    assistant = await serverFetch<Assistant>(`/assistants/${id}/`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const [policy, usage, knowledgeBases, aiSettings] = await Promise.all([
    serverFetchOrNull<AssistantPolicy>(`/assistants/${id}/policy/`),
    serverFetchOrNull<AssistantUsage>(`/assistants/${id}/usage/`),
    serverFetchOrNull<Paginated<KnowledgeBase>>("/knowledge-bases/", { query: { page_size: 100 } }),
    serverFetchOrNull<AISettings>(`/organizations/${tenant.organizationId}/ai-settings/`),
  ]);

  // The form offers every provider the workspace may use; the workspace default is
  // only a placeholder here because the assistant already has a provider of its own.
  const availableProviders = aiSettings?.available_providers ?? [assistant.model_provider];
  const defaultModel = aiSettings?.model || aiSettings?.environment.model || "";

  const canWrite = tenant.session.capabilities.includes("assistant:write");
  const canEvaluate = tenant.session.capabilities.includes("policy:evaluate");
  const canWritePolicy = tenant.session.capabilities.includes("policy:write");

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link href="/dashboard/assistants">
            <ArrowLeftIcon className="size-4" />
            Assistants
          </Link>
        </Button>
      </div>

      <PageHeader
        title={assistant.name}
        description={assistant.description || `Slug: ${assistant.slug}`}
        actions={canWrite ? <AssistantActions assistant={assistant} /> : null}
      />

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <StatusBadge status={assistant.status} />
        <Badge variant="outline" className="font-normal">
          {DOMAIN_LABELS[assistant.domain_type] ?? assistant.domain_type}
        </Badge>
        <Badge variant="outline" className="font-normal">
          config v{assistant.config_version}
        </Badge>
        <span className="text-muted-foreground text-xs">Updated {formatDateTime(assistant.updated_at)}</span>
      </div>

      <Tabs defaultValue="overview">
        <TabsList variant="line" className="w-full justify-start border-b">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="policy">Policy</TabsTrigger>
          <TabsTrigger value="evaluations">Evaluations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Requests" value={formatNumber(usage?.total_requests)} hint="Lifetime chat calls" />
            <Stat
              label="Answered"
              value={formatNumber(usage?.successful)}
              hint={usage ? `${formatNumber(usage.refused)} refused` : undefined}
            />
            <Stat
              label="Tokens"
              value={formatNumber((usage?.input_tokens ?? 0) + (usage?.output_tokens ?? 0))}
              hint="Input + output, estimated"
            />
            <Stat label="Average latency" value={`${formatNumber(usage?.average_latency_ms)} ms`} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Scope</CardTitle>
                <CardDescription>Topics the assistant may and may not discuss.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="font-medium text-sm">Allowed</span>
                  <TopicList topics={assistant.allowed_topics} empty="No allowed topics configured." />
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-medium text-sm">Prohibited</span>
                  <TopicList topics={assistant.prohibited_topics} empty="No explicit prohibitions." />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Runtime</CardTitle>
                <CardDescription>What the request pipeline uses.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="font-medium">{assistant.model_provider}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Model</span>
                  <span className="font-medium">{assistant.model_name}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Max output tokens</span>
                  <span className="font-medium tabular-nums">{assistant.maximum_output_tokens}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Grounding required</span>
                  <span className="font-medium">{assistant.knowledge_required ? "Yes" : "No"}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Knowledge bases</span>
                  <span className="font-medium tabular-nums">{assistant.knowledge_base_ids.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Fallback message</CardTitle>
              <CardDescription>Returned verbatim whenever the assistant refuses a request.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="rounded-lg border bg-muted/40 p-3 text-sm">{assistant.fallback_message}</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration">
          {canWrite ? (
            <AssistantForm
              assistant={assistant}
              knowledgeBases={knowledgeBases?.results ?? []}
              availableProviders={availableProviders}
              providerLabels={aiSettings?.provider_labels ?? {}}
              defaultProvider={assistant.model_provider}
              defaultModel={defaultModel}
            />
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                Your role can view this assistant but not change its configuration.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="policy" className="flex flex-col gap-4">
          {policy ? (
            <>
              <AssistantPolicyForm policy={policy} canWrite={canWritePolicy} />

              <Card>
                <CardHeader>
                  <CardTitle>Test this policy</CardTitle>
                  <CardDescription>
                    Run labelled cases through the current rules, or send a live request in the playground.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/playground?assistant=${assistant.id}`}>
                      <ExternalLinkIcon className="size-4" />
                      Open in playground
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/dashboard/knowledge">
                      <BookOpenIcon className="size-4" />
                      Manage sources
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground text-sm">
                The policy is not available for this assistant yet.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="evaluations">
          <AssistantEvaluations assistantId={assistant.id} canEvaluate={canEvaluate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
