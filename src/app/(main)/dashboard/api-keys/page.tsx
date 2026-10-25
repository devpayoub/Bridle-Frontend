import { redirect } from "next/navigation";

import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { serverFetch, serverFetchOrNull } from "@/lib/api/server";
import type { ApiKey, Assistant, Paginated } from "@/lib/api/types";
import { requireTenant } from "@/lib/tenant/server";

import { ApiKeysPanel } from "./_components/api-keys-panel";

export const metadata: Metadata = {
  title: "API keys",
};

export default async function ApiKeysPage() {
  const tenant = await requireTenant();

  if (!tenant.session.capabilities.includes("apikey:read")) {
    redirect("/unauthorized");
  }

  const [apiKeys, assistants] = await Promise.all([
    serverFetch<Paginated<ApiKey>>("/api-keys/", { query: { page_size: 100 } }),
    serverFetchOrNull<Paginated<Assistant>>("/assistants/", { query: { page_size: 100 } }),
  ]);

  const canWrite = tenant.session.capabilities.includes("apikey:write");

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="API keys"
        description="Server-to-server credentials for the chat completions endpoint. Keys look like bb-… (50 characters) and are shown once."
      />

      <ApiKeysPanel apiKeys={apiKeys.results} assistants={assistants?.results ?? []} canWrite={canWrite} />

      <Card>
        <CardHeader>
          <CardTitle>Calling the API</CardTitle>
          <CardDescription>Send the key as a bearer token. The workspace is derived from the key.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg border bg-muted/40 p-3 font-mono text-xs leading-relaxed">
            {`curl -X POST "$API_BASE_URL/api/v1/chat/completions/" \\
  -H "Authorization: Bearer bb-..." \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: $(uuidgen)" \\
  -d '{
    "assistant_id": "<assistant-uuid>",
    "message": "What is the check-in time?"
  }'`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
