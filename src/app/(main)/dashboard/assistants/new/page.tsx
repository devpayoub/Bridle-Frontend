import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { serverFetchOrNull } from "@/lib/api/server";
import type { AISettings, KnowledgeBase, Paginated } from "@/lib/api/types";
import { requireTenant } from "@/lib/tenant/server";

import { AssistantForm } from "../_components/assistant-form";

export const metadata: Metadata = {
  title: "New assistant",
};

export default async function NewAssistantPage() {
  const tenant = await requireTenant();

  if (!tenant.session.capabilities.includes("assistant:write")) {
    redirect("/unauthorized");
  }

  const [knowledgeBases, aiSettings] = await Promise.all([
    serverFetchOrNull<Paginated<KnowledgeBase>>("/knowledge-bases/", { query: { page_size: 100 } }),
    serverFetchOrNull<AISettings>(`/organizations/${tenant.organizationId}/ai-settings/`),
  ]);

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
        title="New assistant"
        description="Assistants start as drafts. Define the domain and scope, then activate it when you are ready for traffic."
      />

      <AssistantForm
        knowledgeBases={knowledgeBases?.results ?? []}
        availableProviders={aiSettings?.available_providers ?? ["mock"]}
        providerLabels={aiSettings?.provider_labels ?? {}}
        defaultProvider={aiSettings?.provider ?? "mock"}
        defaultModel={aiSettings?.model || aiSettings?.environment.model || ""}
      />
    </div>
  );
}
