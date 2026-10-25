"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { LogOutIcon, MailIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api/errors";

export function AccountActions({ isVerified }: { isVerified: boolean }) {
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const resend = async () => {
    setResending(true);
    try {
      const response = await fetch("/api/auth/verify-email/resend", { method: "POST" });
      if (!response.ok) {
        const error = await ApiError.fromResponse(response);
        toast.error(error.message);
        return;
      }
      toast.success("Verification email sent. Check your inbox.");
    } catch {
      toast.error("Could not reach the server. Please try again.");
    } finally {
      setResending(false);
    }
  };

  const signOut = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/auth/login");
      router.refresh();
    } catch {
      toast.error("Could not sign out. Please try again.");
      setSigningOut(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!isVerified ? (
        <Button variant="outline" size="sm" onClick={resend} disabled={resending}>
          {resending ? <Spinner className="size-4" /> : <MailIcon className="size-4" />}
          Resend verification
        </Button>
      ) : null}
      <Button variant="outline" size="sm" onClick={signOut} disabled={signingOut}>
        {signingOut ? <Spinner className="size-4" /> : <LogOutIcon className="size-4" />}
        Sign out
      </Button>
    </div>
  );
}
