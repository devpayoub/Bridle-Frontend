import { CheckCircle2Icon, CircleAlertIcon } from "lucide-react";
import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ROLE_LABELS } from "@/lib/auth/capabilities";
import { requireTenant } from "@/lib/tenant/server";

import { AccountActions } from "../_components/account-actions";

export const metadata: Metadata = {
  title: "Account",
};

export default async function AccountSettingsPage() {
  const tenant = await requireTenant();
  const { user, memberships } = tenant.session;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>The identity used for sign-in and audit attribution.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Name</span>
            <span className="font-medium">{user.full_name || "—"}</span>
          </div>

          <Separator />

          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">Email status</span>
              <span className="flex items-center gap-1.5 font-medium text-sm">
                {user.is_email_verified ? (
                  <>
                    <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
                    Verified
                  </>
                ) : (
                  <>
                    <CircleAlertIcon className="size-4 text-amber-600 dark:text-amber-400" />
                    Not verified
                  </>
                )}
              </span>
            </div>
            <AccountActions isVerified={user.is_email_verified} />
          </div>

          {!user.is_email_verified ? (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-900 text-sm dark:text-amber-200">
              Some features stay limited until you confirm your address. Resend the link above if the original email
              never arrived.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Workspaces</CardTitle>
          <CardDescription>Your role in each workspace.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {memberships.length === 0 ? (
            <p className="text-muted-foreground text-sm">You are not a member of any workspace yet.</p>
          ) : (
            memberships.map((membership) => (
              <div key={membership.organization_id} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-medium">{membership.organization_name}</span>
                <Badge variant="outline" className="shrink-0 font-normal">
                  {ROLE_LABELS[membership.role]}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
