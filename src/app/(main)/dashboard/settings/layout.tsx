import type { ReactNode } from "react";

import { PageHeader } from "@/components/page-header";

import { SettingsNav } from "./_components/settings-nav";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Settings"
        description="Workspace configuration, your profile, and the credentials that protect both."
      />
      <SettingsNav />
      {children}
    </div>
  );
}
