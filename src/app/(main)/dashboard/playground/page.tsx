import { redirect } from "next/navigation";

import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { serverFetch } from "@/lib/api/server";
import type { Assistant, Paginated } from "@/lib/api/types";
import { requireTenant } from "@/lib/tenant/server";

import { Playground } from "./_components/playground";

export const metadata: Metadata = {
  title: "Playground",
};

export default async function PlaygroundPage({ searchParams }: { searchParams: Promise<{ assistant?: string }> }) {
  const { assistant } = await searchParams;
  const tenant = await requireTenant();

  if (!tenant.session.capabilities.includes("chat:write")) {
    redirect("/unauthorized");
  }

  const assistants = await serverFetch<Paginated<Assistant>>("/assistants/", { query: { page_size: 100 } });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Playground"
        description="Send real requests through the full pipeline: screening, retrieval, generation and response validation."
      />

      <Playground assistants={assistants.results} initialAssistantId={assistant ?? assistants.results[0]?.id} />
    </div>
  );
}
