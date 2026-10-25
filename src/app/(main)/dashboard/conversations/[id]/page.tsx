import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeftIcon, FileTextIcon } from "lucide-react";
import type { Metadata } from "next";

import { DecisionBadge } from "@/components/decision-badge";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ApiError } from "@/lib/api/errors";
import { serverFetch } from "@/lib/api/server";
import type { Conversation, Message, Paginated } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";
import { requireTenant } from "@/lib/tenant/server";

import { AnonymiseConversation } from "../_components/anonymise-conversation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const conversation = await serverFetch<Conversation>(`/conversations/${id}/`);
    return { title: `${conversation.assistant_name} conversation` };
  } catch {
    return { title: "Conversation" };
  }
}

const ROLE_LABELS: Record<string, string> = {
  USER: "User",
  ASSISTANT: "Assistant",
  SYSTEM: "System",
  TOOL: "Tool",
};

function MessageBlock({ message }: { message: Message }) {
  const isUser = message.role === "USER";
  const isBlocked = message.status !== "COMPLETED";

  return (
    <div className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
      <div className="flex items-center gap-2 text-muted-foreground text-xs">
        <span className="font-medium text-foreground">{ROLE_LABELS[message.role] ?? message.role}</span>
        <span>{formatDateTime(message.created_at)}</span>
        {message.policy_decision ? <DecisionBadge decision={message.policy_decision} /> : null}
      </div>

      <div
        className={`max-w-[min(46rem,92%)] rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser ? "bg-primary text-primary-foreground" : isBlocked ? "bg-destructive/5" : "bg-muted/50"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content || "—"}</p>
      </div>

      {message.citations.length > 0 ? (
        <div className="flex max-w-[min(46rem,92%)] flex-col gap-1.5">
          {message.citations.map((citation) => (
            <div
              key={`${citation.document_id}-${citation.chunk_index}`}
              className="flex items-center gap-2 rounded-md border bg-background px-2.5 py-1.5 text-xs"
            >
              <FileTextIcon className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate font-medium">{citation.document_title}</span>
              <span className="text-muted-foreground">
                chunk {citation.chunk_index}
                {citation.page_number ? ` · p.${citation.page_number}` : ""}
              </span>
              <Badge variant="outline" className="ml-auto font-normal tabular-nums">
                {citation.score.toFixed(2)}
              </Badge>
            </div>
          ))}
        </div>
      ) : null}

      {message.refusal_reason_code ? (
        <p className="text-muted-foreground text-xs">Reason code: {message.refusal_reason_code}</p>
      ) : null}

      {!isUser && message.status === "COMPLETED" ? (
        <p className="text-muted-foreground text-xs tabular-nums">
          {message.input_tokens + message.output_tokens} tokens · {message.latency_ms} ms
        </p>
      ) : null}
    </div>
  );
}

export default async function ConversationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenant = await requireTenant();

  let conversation: Conversation;
  try {
    conversation = await serverFetch<Conversation>(`/conversations/${id}/`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const messages = await serverFetch<Paginated<Message>>(`/conversations/${id}/messages/`, {
    query: { page_size: 200 },
  });

  const canDelete = tenant.session.capabilities.includes("conversation:delete");

  return (
    <div className="flex flex-col gap-5">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
          <Link href="/dashboard/conversations">
            <ArrowLeftIcon className="size-4" />
            Conversations
          </Link>
        </Button>
      </div>

      <PageHeader
        title={`${conversation.assistant_name} conversation`}
        description={`Started ${formatDateTime(conversation.created_at)} · config v${conversation.config_version}`}
        actions={
          canDelete && conversation.status !== "ANONYMIZED" ? (
            <AnonymiseConversation conversationId={conversation.id} />
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={conversation.status} />
        <Badge variant="outline" className="font-normal">
          {conversation.message_count} messages
        </Badge>
        <Badge variant="outline" className="font-normal">
          {conversation.external_user_id || "Anonymous user"}
        </Badge>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-5">
          {messages.results.length === 0 ? (
            <p className="py-10 text-center text-muted-foreground text-sm">This conversation has no messages.</p>
          ) : (
            messages.results.map((message, index) => (
              <div key={message.id} className="flex flex-col gap-5">
                {index > 0 ? <Separator /> : null}
                <MessageBlock message={message} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
