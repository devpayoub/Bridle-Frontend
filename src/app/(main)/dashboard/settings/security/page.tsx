import type { Metadata } from "next";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireTenant } from "@/lib/tenant/server";

import { ChangePasswordForm } from "../_components/change-password-form";
import { DeactivateAccount } from "../_components/deactivate-account";

export const metadata: Metadata = {
  title: "Security",
};

export default async function SecuritySettingsPage() {
  await requireTenant();

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Changing your password signs you out of every session, then you sign in again with the new one.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <ChangePasswordForm />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>How this deployment keeps you signed in.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="flex flex-col gap-1 rounded-lg border p-3">
            <span className="font-medium">Short-lived access</span>
            <span className="text-muted-foreground">
              Access tokens last 15 minutes and are stored in an httpOnly cookie.
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border p-3">
            <span className="font-medium">Rotating refresh</span>
            <span className="text-muted-foreground">
              Refresh tokens rotate on every use; a replayed token is rejected.
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border p-3">
            <span className="font-medium">Server-side BFF</span>
            <span className="text-muted-foreground">
              Browser calls go through this app; the API token is never exposed to JavaScript.
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
          <CardDescription>Irreversible actions. Make sure you have what you need first.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-sm">Deactivate this account</span>
            <span className="text-muted-foreground text-sm">
              Blocks sign-in and revokes every refresh token for your account.
            </span>
          </div>
          <DeactivateAccount />
        </CardContent>
      </Card>
    </div>
  );
}
