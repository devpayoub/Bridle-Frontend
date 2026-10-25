import { cn } from "cn";

import { Badge } from "@/components/ui/badge";
import type { AssistantStatus, ConversationStatus, DocumentStatus } from "@/lib/api/types";

const ASSISTANT_TONES: Record<AssistantStatus, string> = {
  DRAFT: "border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
  ACTIVE: "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  PAUSED: "border-amber-600/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  ARCHIVED: "border-zinc-500/20 bg-zinc-500/5 text-zinc-500",
};

const DOCUMENT_TONES: Record<DocumentStatus, string> = {
  PENDING: "border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
  PROCESSING: "border-blue-600/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  READY: "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  FAILED: "border-destructive/30 bg-destructive/10 text-destructive",
};

const CONVERSATION_TONES: Record<ConversationStatus, string> = {
  ACTIVE: "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  CLOSED: "border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
  ANONYMIZED: "border-zinc-500/20 bg-zinc-500/5 text-zinc-500",
};

const LABELS: Record<string, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  PAUSED: "Paused",
  ARCHIVED: "Archived",
  PENDING: "Pending",
  PROCESSING: "Processing",
  READY: "Ready",
  FAILED: "Failed",
  CLOSED: "Closed",
  ANONYMIZED: "Anonymised",
};

export function StatusBadge({ status }: { status: AssistantStatus | DocumentStatus | ConversationStatus }) {
  const tone =
    (ASSISTANT_TONES as Record<string, string>)[status] ??
    (DOCUMENT_TONES as Record<string, string>)[status] ??
    (CONVERSATION_TONES as Record<string, string>)[status] ??
    "";

  return (
    <Badge variant="outline" className={cn("gap-1.5 border px-2 py-0.5 font-medium", tone)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {LABELS[status] ?? status}
    </Badge>
  );
}
