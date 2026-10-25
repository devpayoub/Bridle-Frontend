import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { forwardAuthenticated } from "@/lib/api/forward";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";

/**
 * Password change for the signed-in user.
 *
 * Kept on the server so the current access token never reaches the browser.
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

  let body: { current_password?: string; new_password?: string };
  try {
    body = (await request.json()) as { current_password?: string; new_password?: string };
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_body", message: "Send a JSON body.", details: null, request_id: "" } },
      { status: 400 },
    );
  }

  if (!body.current_password || !body.new_password) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message: "Your current password and a new password are required.",
          details: null,
          request_id: "",
        },
      },
      { status: 400 },
    );
  }

  return forwardAuthenticated(request, "/auth/password-change/", {
    accessToken,
    body: { current_password: body.current_password, new_password: body.new_password },
  });
}
