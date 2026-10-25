import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { forwardAuthenticated } from "@/lib/api/forward";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";

/** Resend the verification email for the signed-in user. */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;

  if (!accessToken) {
    return NextResponse.json(
      { error: { code: "not_authenticated", message: "Your session has expired.", details: null, request_id: "" } },
      { status: 401 },
    );
  }

  return forwardAuthenticated(request, "/auth/verify-email/resend/", { accessToken });
}
