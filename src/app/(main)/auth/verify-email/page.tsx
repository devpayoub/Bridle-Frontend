import type { Metadata } from "next";

import { VerifyEmailPanel } from "../_components/verify-email-panel";

export const metadata: Metadata = {
  title: "Verify email",
};

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1.5">
        <h1 className="font-semibold text-2xl tracking-tight">Email verification</h1>
        <p className="text-muted-foreground text-sm">Confirming the address on your account.</p>
      </header>

      <VerifyEmailPanel token={token ?? null} />
    </div>
  );
}
