import { redirect } from "next/navigation";

import { BuildingIcon } from "lucide-react";
import type { Metadata } from "next";

import { BrandLockup } from "@/components/brand";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession } from "@/lib/tenant/server";

import { OnboardingForm } from "./_components/onboarding-form";

export const metadata: Metadata = {
  title: "Create your workspace",
};

export default async function OnboardingPage() {
  const session = await requireSession();

  if (session.activeOrganizationId) {
    redirect("/dashboard/overview");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-5 py-10">
      <BrandLockup />

      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted">
            <BuildingIcon className="size-5" />
          </div>
          <CardTitle>Create your workspace</CardTitle>
          <CardDescription>
            Hi {session.user.full_name || session.user.email}. A workspace holds your assistants, knowledge and team.
            You can create more later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm />
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-xs">
        You will be the owner of this workspace and can invite teammates afterwards.
      </p>
    </div>
  );
}
