import { redirect } from "next/navigation";

import { PlugZapIcon } from "lucide-react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { serverFetchOrNull } from "@/lib/api/server";
import type { Assistant, Channel, Paginated } from "@/lib/api/types";
import { requireTenant } from "@/lib/tenant/server";

import { ChannelsPanel } from "./_components/channels-panel";

export const metadata: Metadata = { title: "Channels" };

export default async function ChannelsPage() {
  const tenant = await requireTenant();
  if (!tenant.session.capabilities.includes("channel:read")) redirect("/unauthorized");

  const [channels, assistants] = await Promise.all([
    // The API returns 404 while CHANNELS_ENABLED is off. That is a deployment
    // state, not a failure — explain it instead of throwing a 500.
    serverFetchOrNull<Paginated<Channel>>("/channels/", { query: { page_size: 100 } }),
    serverFetchOrNull<Paginated<Assistant>>("/assistants/", {
      query: { status: "ACTIVE", page_size: 100 },
    }),
  ]);

  if (!channels) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader
          title="Channels"
          description="Connect a messaging bot to an assistant. The same policy, grounding and audit trail apply — the answer just arrives in a chat app."
        />
        <Card>
          <CardContent className="p-0">
            <Empty className="border-none py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <PlugZapIcon />
                </EmptyMedia>
                <EmptyTitle>Channels are not enabled on this deployment</EmptyTitle>
                <EmptyDescription>
                  An operator has to set <code className="font-mono text-xs">CHANNELS_ENABLED=true</code> and{" "}
                  <code className="font-mono text-xs">CHANNELS_PUBLIC_BASE_URL</code> on the API, then restart it.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canWrite = tenant.session.capabilities.includes("channel:write");

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Channels"
        description="Connect a messaging bot to an assistant. The same policy, grounding and audit trail apply — the answer just arrives in a chat app."
      />
      <ChannelsPanel channels={channels.results} assistants={assistants?.results ?? []} canWrite={canWrite} />
    </div>
  );
}
