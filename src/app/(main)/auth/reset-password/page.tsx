import Link from "next/link";

import { AlertCircleIcon } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";

import { ResetPasswordForm } from "../_components/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password",
};

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircleIcon className="size-5 text-destructive" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="font-semibold text-2xl tracking-tight">Link is missing a token</h1>
          <p className="text-muted-foreground text-sm">
            This page needs the token from your reset email. Request a new link to continue.
          </p>
        </div>
        <Button asChild className="w-full">
          <Link href="/auth/forgot-password">Request a new link</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="font-semibold text-2xl tracking-tight">Choose a new password</h1>
        <p className="text-muted-foreground text-sm">Your reset link works once and expires after an hour.</p>
      </header>

      <ResetPasswordForm token={token} />
    </div>
  );
}
