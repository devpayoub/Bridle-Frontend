"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";

import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/api/errors";

type State = { status: "verifying" } | { status: "success" } | { status: "error"; message: string };

export function VerifyEmailPanel({ token }: { token: string | null }) {
  const [state, setState] = useState<State>(
    token ? { status: "verifying" } : { status: "error", message: "This link is missing its token." },
  );
  const submitted = useRef(false);

  useEffect(() => {
    if (!token || submitted.current) return;
    submitted.current = true;

    const verify = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const error = await ApiError.fromResponse(response);
          setState({
            status: "error",
            message:
              error.code === "invalid_token"
                ? "This verification link is invalid or has already been used."
                : error.message,
          });
          return;
        }

        setState({ status: "success" });
      } catch {
        setState({ status: "error", message: "Could not reach the server. Please try again." });
      }
    };

    void verify();
  }, [token]);

  if (state.status === "verifying") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <Spinner className="size-6" />
        <p className="text-muted-foreground text-sm">Verifying your email…</p>
      </div>
    );
  }

  if (state.status === "success") {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex size-11 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2Icon className="size-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h2 className="font-semibold text-lg">Email verified</h2>
          <p className="text-muted-foreground text-sm">Your address is confirmed. You can close this page.</p>
        </div>
        <Button asChild className="w-full">
          <Link href="/dashboard/overview">Go to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircleIcon className="size-5 text-destructive" />
      </div>
      <div className="flex flex-col gap-1.5">
        <h2 className="font-semibold text-lg">We could not verify that link</h2>
        <p className="text-muted-foreground text-sm">{state.message}</p>
      </div>
      <Button asChild className="w-full">
        <Link href="/dashboard/settings/account">Resend from settings</Link>
      </Button>
      <Button asChild variant="ghost" className="w-full">
        <Link href="/auth/login">Back to sign in</Link>
      </Button>
    </div>
  );
}
