"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { ArchiveIcon, CopyIcon, PauseIcon, PlayIcon } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { apiPost } from "@/lib/api/client";
import { ApiError, errorMessage } from "@/lib/api/errors";
import type { Assistant, AssistantStatus } from "@/lib/api/types";

type Action = "activate" | "pause" | "archive" | "duplicate";

export function AssistantActions({ assistant }: { assistant: Assistant }) {
  const router = useRouter();
  const [pending, setPending] = useState<Action | null>(null);
  const status: AssistantStatus = assistant.status;

  const run = async (action: Action) => {
    setPending(action);
    try {
      const updated = await apiPost<Assistant>(`/assistants/${assistant.id}/${action}/`);
      if (action === "duplicate") {
        toast.success("Assistant duplicated as a draft.");
        router.push(`/dashboard/assistants/${updated.id}`);
      } else {
        toast.success(
          action === "activate"
            ? "Assistant activated."
            : action === "pause"
              ? "Assistant paused."
              : "Assistant archived.",
        );
      }
      router.refresh();
    } catch (error) {
      // Activation failures list what is missing in `details.issues`; that detail
      // is far more useful than the generic message.
      const issues =
        error instanceof ApiError && Array.isArray(error.details?.issues) ? (error.details.issues as string[]) : [];
      toast.error(issues.length > 0 ? issues.join(" ") : errorMessage(error));
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status !== "ACTIVE" && status !== "ARCHIVED" ? (
        <Button size="sm" onClick={() => run("activate")} disabled={pending !== null}>
          {pending === "activate" ? <Spinner className="size-4" /> : <PlayIcon className="size-4" />}
          Activate
        </Button>
      ) : null}

      {status === "ACTIVE" ? (
        <Button size="sm" variant="outline" onClick={() => run("pause")} disabled={pending !== null}>
          {pending === "pause" ? <Spinner className="size-4" /> : <PauseIcon className="size-4" />}
          Pause
        </Button>
      ) : null}

      <Button size="sm" variant="outline" onClick={() => run("duplicate")} disabled={pending !== null}>
        {pending === "duplicate" ? <Spinner className="size-4" /> : <CopyIcon className="size-4" />}
        Duplicate
      </Button>

      {status !== "ARCHIVED" ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant="ghost" className="text-muted-foreground" disabled={pending !== null}>
              <ArchiveIcon className="size-4" />
              Archive
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive this assistant?</AlertDialogTitle>
              <AlertDialogDescription>
                Requests sent to an archived assistant are rejected. Existing conversations and audit history are kept.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => run("archive")}>Archive assistant</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </div>
  );
}
