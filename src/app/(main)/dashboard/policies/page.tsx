import { redirect } from "next/navigation";

import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { serverFetchOrNull } from "@/lib/api/server";
import type { Assistant, Paginated } from "@/lib/api/types";
import { requireTenant } from "@/lib/tenant/server";

import { PolicyLab } from "./_components/policy-lab";

export const metadata: Metadata = {
  title: "Policy lab",
};

export default async function PoliciesPage({ searchParams }: { searchParams: Promise<{ assistant?: string }> }) {
  const { assistant } = await searchParams;
  const tenant = await requireTenant();

  if (!tenant.session.capabilities.includes("policy:evaluate")) {
    redirect("/unauthorized");
  }

  const assistants = await serverFetchOrNull<Paginated<Assistant>>("/assistants/", { query: { page_size: 100 } });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Policy lab"
        description="Send a request through the screening engine without calling a model. Every evaluation is recorded and counts against the policy quota."
      />

      <PolicyLab assistants={assistants?.results ?? []} initialAssistantId={assistant} />
    </div>
  );
}
