"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { ShieldOffIcon } from "lucide-react";
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
import { apiDelete } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";

export function AnonymiseConversation({ conversationId }: { conversationId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const anonymise = async () => {
    setPending(true);
    try {
      await apiDelete(`/conversations/${conversationId}/`);
      toast.success("Conversation anonymised.");
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setPending(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={pending}>
          {pending ? <Spinner className="size-4" /> : <ShieldOffIcon className="size-4" />}
          Anonymise
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Anonymise this conversation?</AlertDialogTitle>
          <AlertDialogDescription>
            Message content is irreversibly scrubbed and the conversation is closed. The audit trail keeps the event,
            not the text. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={anonymise}>Anonymise</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
