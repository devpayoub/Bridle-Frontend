import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { forwardAuthenticated } from "@/lib/api/forward";
import { ACCESS_COOKIE, ORG_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookies";

/**
 * Deactivate the current account.
 *
 * The upstream call invalidates every refresh token, so the local session is
 * cleared unconditionally — including when the call itself fails, because the
 * account may already be inactive.
 */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: { code: "not_authenticated", message: "Your session has expired.", details: null, request_id: "" } },
      { status: 401 },
    );
  }

  const upstream = await forwardAuthenticated(request, "/auth/deactivate/", { accessToken });

  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
  });

  if (upstream.ok) {
    response.cookies.delete(ACCESS_COOKIE);
    response.cookies.delete(REFRESH_COOKIE);
    response.cookies.delete(ORG_COOKIE);
  }

  return response;
}
