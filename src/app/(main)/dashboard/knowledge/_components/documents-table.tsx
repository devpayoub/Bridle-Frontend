"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { RefreshCwIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { StatusBadge } from "@/components/status-badge";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiDelete, apiPost } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import type { Document } from "@/lib/api/types";
import { formatBytes, formatDateTime } from "@/lib/format";

export function DocumentsTable({ documents, canWrite }: { documents: Document[]; canWrite: boolean }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const processing = documents.some((document) => document.status === "PENDING" || document.status === "PROCESSING");

  // Ingestion runs in a Celery worker; poll while anything is still in flight.
  useEffect(() => {
    if (!processing) return;
    const timer = setInterval(() => router.refresh(), 4000);
    return () => clearInterval(timer);
  }, [processing, router]);

  const reprocess = async (document: Document) => {
    setBusyId(document.id);
    try {
      await apiPost(`/documents/${document.id}/reprocess/`);
      toast.success("Reprocessing queued.");
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (document: Document) => {
    setBusyId(document.id);
    try {
      await apiDelete(`/documents/${document.id}/`);
      toast.success("Document deleted.");
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-4">Document</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Chunks</TableHead>
          <TableHead className="text-right">Size</TableHead>
          <TableHead>Uploaded</TableHead>
          {canWrite ? <TableHead className="pr-4 text-right">Actions</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((document) => (
          <TableRow key={document.id}>
            <TableCell className="pl-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">{document.title || document.original_filename}</span>
                <span className="max-w-[42ch] truncate text-muted-foreground text-xs">
                  {document.original_filename}
                  {document.page_count > 0 ? ` · ${document.page_count} pages` : ""}
                </span>
                {document.status === "FAILED" && document.error_message ? (
                  <span className="text-destructive text-xs">{document.error_message}</span>
                ) : null}
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge status={document.status} />
            </TableCell>
            <TableCell className="text-right text-sm tabular-nums">{document.chunk_count}</TableCell>
            <TableCell className="text-right text-muted-foreground text-sm tabular-nums">
              {formatBytes(document.size_bytes)}
            </TableCell>
            <TableCell className="text-muted-foreground text-sm tabular-nums">
              {formatDateTime(document.created_at)}
            </TableCell>
            {canWrite ? (
              <TableCell className="pr-4">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Reprocess document"
                    disabled={busyId === document.id}
                    onClick={() => reprocess(document)}
                  >
                    <RefreshCwIcon className="size-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Delete document"
                        className="text-muted-foreground hover:text-destructive"
                        disabled={busyId === document.id}
                      >
                        <Trash2Icon className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this document?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Its chunks are removed from retrieval immediately. Answers that already cited it keep their
                          citations in the conversation history.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => remove(document)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            ) : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
