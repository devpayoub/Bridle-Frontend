import { NextResponse } from "next/server";

import { forwardPublicJson, readJson } from "@/lib/api/forward";

export async function POST(request: Request) {
  const body = await readJson<{ token?: string; new_password?: string }>(request);
  if (!body?.token || !body?.new_password) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_request",
          message: "A reset token and a new password are required.",
          details: null,
          request_id: "",
        },
      },
      { status: 400 },
    );
  }

  return forwardPublicJson("/auth/password-reset/confirm/", request, {
    token: body.token,
    new_password: body.new_password,
  });
}
