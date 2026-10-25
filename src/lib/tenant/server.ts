import "server-only";

import { redirect } from "next/navigation";

import { getSession, type Session } from "@/lib/auth/session";

export type TenantContext = {
  session: Session;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  role: NonNullable<Session["role"]>;
};

/** Require a session, otherwise send the user to the login screen. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }
  return session;
}

/**
 * Require a session **and** an active organization.
 *
 * Users with no workspace are routed to onboarding; the cookie is only a
 * preference — membership is re-validated on every request by the API.
 */
export async function requireTenant(): Promise<TenantContext> {
  const session = await requireSession();

  if (!session.activeOrganization || !session.role) {
    redirect("/onboarding");
  }

  return {
    session,
    organizationId: session.activeOrganization.organization_id,
    organizationName: session.activeOrganization.organization_name,
    organizationSlug: session.activeOrganization.organization_slug,
    role: session.role,
  };
}
