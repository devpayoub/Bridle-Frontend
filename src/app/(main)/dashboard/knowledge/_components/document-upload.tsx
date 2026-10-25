"use client";

import { useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { UploadIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { apiUpload } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import type { Document } from "@/lib/api/types";

const ACCEPT = ".pdf,.docx,.html,.htm,.md,.markdown,.txt";

export function DocumentUpload({ knowledgeBaseId }: { knowledgeBaseId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");

    if (!(file instanceof File) || file.size === 0) {
      toast.error("Choose a file to upload.");
      return;
    }

    setPending(true);
    try {
      await apiUpload<Document>(`/knowledge-bases/${knowledgeBaseId}/documents/`, data);
      toast.success("Upload accepted. Ingestion is queued.");
      form.reset();
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input
        ref={inputRef}
        type="file"
        name="file"
        accept={ACCEPT}
        aria-label="Document file"
        className="h-9 cursor-pointer file:mr-2 file:font-medium sm:max-w-sm"
      />
      <Input name="title" placeholder="Optional title" aria-label="Document title" className="h-9 sm:max-w-xs" />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : <UploadIcon className="size-4" />}
        Upload
      </Button>
    </form>
  );
}
