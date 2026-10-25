"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { UserXIcon } from "lucide-react";
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
import { ApiError } from "@/lib/api/errors";

export function DeactivateAccount() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const deactivate = async () => {
    setPending(true);
    try {
      const response = await fetch("/api/auth/deactivate", { method: "POST" });
      if (!response.ok) {
        const error = await ApiError.fromResponse(response);
        toast.error(error.message);
        return;
      }
      toast.success("Account deactivated.");
      router.replace("/auth/login");
      router.refresh();
    } catch {
      toast.error("Could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={pending}>
          {pending ? <Spinner className="size-4" /> : <UserXIcon className="size-4" />}
          Deactivate account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate your account?</AlertDialogTitle>
          <AlertDialogDescription>
            You are signed out everywhere and cannot sign in again. Workspaces you own keep their data; ask an admin to
            restore access if this was a mistake.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deactivate}>Deactivate</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
