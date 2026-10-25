"use client";

import { useState } from "react";

import { SendIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { DecisionBadge } from "@/components/decision-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { apiPost } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import type { Assistant, ChatResponse, Citation } from "@/lib/api/types";

type Turn = {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
  decision?: string;
  reasonCode?: string;
  citations?: Citation[];
  latencyMs?: number;
  tokens?: number;
  requestId?: string;
};

export function Playground({
  assistants,
  initialAssistantId,
}: {
  assistants: Assistant[];
  initialAssistantId?: string;
}) {
  const [assistantId, setAssistantId] = useState(initialAssistantId ?? assistants[0]?.id ?? "");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);

  const send = async () => {
    const message = input.trim();
    if (!message || !assistantId || pending) return;

    setTurns((current) => [...current, { id: `u-${Date.now()}`, role: "user", content: message }]);
    setInput("");
    setPending(true);

    try {
      const response = await apiPost<ChatResponse>(
        "/chat/completions/",
        {
          assistant_id: assistantId,
          message,
          ...(conversationId ? { conversation_id: conversationId } : {}),
        },
        // Retries with the same key replay the original answer instead of billing twice.
        { idempotencyKey: crypto.randomUUID() },
      );

      setConversationId(response.conversation_id);
      setTurns((current) => [
        ...current,
        {
          id: response.message_id,
          role: "assistant",
          content: response.content,
          decision: response.decision,
          reasonCode: response.reason_code,
          citations: response.citations,
          latencyMs: response.latency_ms,
          tokens: response.usage.input_tokens + response.usage.output_tokens,
          requestId: response.request_id,
        },
      ]);
    } catch (error) {
      const text = errorMessage(error);
      toast.error(text);
      setTurns((current) => [...current, { id: `e-${Date.now()}`, role: "error", content: text }]);
    } finally {
      setPending(false);
    }
  };

  const reset = () => {
    setTurns([]);
    setConversationId(null);
    setInput("");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <Card className="flex min-h-[32rem] flex-col">
        <CardHeader className="flex-row items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle>Playground</CardTitle>
            <CardDescription>
              {conversationId ? `Conversation ${conversationId.slice(0, 8)}…` : "New conversation"}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={reset} disabled={pending || turns.length === 0}>
            <Trash2Icon className="size-4" />
            Reset
          </Button>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col gap-4">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
            {turns.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-1 text-center">
                <p className="font-medium text-sm">Send a request to see the policy decision.</p>
                <p className="max-w-sm text-muted-foreground text-sm">
                  Requests are screened before the model runs, so a refusal here costs nothing.
                </p>
              </div>
            ) : (
              turns.map((turn) => (
                <div
                  key={turn.id}
                  className={`flex flex-col gap-1.5 ${turn.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                      {turn.role === "user" ? "You" : turn.role === "error" ? "Error" : "Assistant"}
                    </span>
                    {turn.decision ? <DecisionBadge decision={turn.decision} /> : null}
                  </div>
                  <div
                    className={`max-w-[min(40rem,92%)] whitespace-pre-wrap break-words rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed ${
                      turn.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : turn.role === "error"
                          ? "border-destructive/30 bg-destructive/5 text-destructive"
                          : "bg-muted/50"
                    }`}
                  >
                    {turn.content}
                  </div>
                  {turn.citations && turn.citations.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {turn.citations.map((citation) => (
                        <span
                          key={`${citation.document_id}-${citation.chunk_index}`}
                          className="rounded-md border bg-background px-2 py-1 text-xs"
                        >
                          {citation.document_title} · chunk {citation.chunk_index}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {turn.role === "assistant" ? (
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {turn.reasonCode} · {turn.tokens} tokens · {turn.latencyMs} ms
                      {turn.requestId ? ` · ${turn.requestId.slice(0, 8)}` : ""}
                    </span>
                  ) : null}
                </div>
              ))
            )}
          </div>

          <div className="flex flex-col gap-2 border-t pt-4">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void send();
                }
              }}
              rows={2}
              placeholder="Ask something inside the assistant's domain…"
              aria-label="Message"
              disabled={pending || !assistantId}
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground text-xs">Enter sends, Shift + Enter adds a line.</span>
              <Button size="sm" onClick={send} disabled={pending || !input.trim() || !assistantId}>
                {pending ? <Spinner className="size-4" /> : <SendIcon className="size-4" />}
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Assistant</CardTitle>
          <CardDescription>Each send is billed against this assistant.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {assistants.length === 0 ? (
            <p className="text-muted-foreground text-sm">No assistants available yet.</p>
          ) : (
            <Select
              value={assistantId}
              onValueChange={(value) => {
                setAssistantId(value);
                reset();
              }}
            >
              <SelectTrigger className="w-full" aria-label="Assistant">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assistants.map((assistant) => (
                  <SelectItem key={assistant.id} value={assistant.id}>
                    {assistant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {assistantId
            ? (() => {
                const selected = assistants.find((assistant) => assistant.id === assistantId);
                if (!selected) return null;
                return (
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium">{selected.status}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Domain</span>
                      <span className="font-medium">{selected.domain_type}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Grounding</span>
                      <span className="font-medium">{selected.knowledge_required ? "Required" : "Optional"}</span>
                    </div>
                    <div className="flex flex-col gap-1.5 pt-1">
                      <span className="text-muted-foreground">Allowed topics</span>
                      <span className="text-xs">{selected.allowed_topics.join(", ") || "None configured"}</span>
                    </div>
                  </div>
                );
              })()
            : null}
        </CardContent>
      </Card>
    </div>
  );
}
