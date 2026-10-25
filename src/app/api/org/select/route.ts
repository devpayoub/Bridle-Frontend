import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import type { MeResponse } from "@/lib/api/types";
import { baseCookieOptions, ORG_COOKIE, ORG_MAX_AGE } from "@/lib/auth/cookies";
import { env } from "@/lib/env";

/**
 * Switch the active organization.
 *
 * Membership is verified against the API before the cookie is written, so a
 * forged organization id cannot become "active".
 */
export async function POST(request: Request) {
  let body: { organizationId?: unknown };
  try {
    body = (await request.json()) as { organizationId?: unknown };
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_body", message: "Send a JSON body.", details: null, request_id: "" } },
      { status: 400 },
    );
  }

  const organizationId = typeof body.organizationId === "string" ? body.organizationId : "";
  if (!organizationId) {
    return NextResponse.json(
      { error: { code: "invalid_body", message: "organizationId is required.", details: null, request_id: "" } },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("ap_at")?.value;
  if (!accessToken) {
    return NextResponse.json(
      { error: { code: "not_authenticated", message: "Not signed in.", details: null, request_id: "" } },
      { status: 401 },
    );
  }

  const meResponse = await fetch(`${env.apiBaseUrl}/api/v1/auth/me/`, {
    headers: { authorization: `Bearer ${accessToken}`, accept: "application/json" },
    cache: "no-store",
  });

  if (!meResponse.ok) {
    return NextResponse.json(
      { error: { code: "not_authenticated", message: "Not signed in.", details: null, request_id: "" } },
      { status: 401 },
    );
  }

  const me = (await meResponse.json()) as MeResponse;
  const isMember = me.memberships.some((membership) => membership.organization_id === organizationId);

  if (!isMember) {
    return NextResponse.json(
      {
        error: {
          code: "not_a_member",
          message: "You do not have access to that organization.",
          details: null,
          request_id: "",
        },
      },
      { status: 403 },
    );
  }

  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(ORG_COOKIE, organizationId, { ...baseCookieOptions, maxAge: ORG_MAX_AGE });
  return response;
}
