import { NextResponse } from "next/server";

import { forwardPublicJson, readJson } from "@/lib/api/forward";

export async function POST(request: Request) {
  const body = await readJson<{ token?: string }>(request);
  if (!body?.token) {
    return NextResponse.json(
      { error: { code: "invalid_token", message: "A verification token is required.", details: null, request_id: "" } },
      { status: 400 },
    );
  }

  return forwardPublicJson("/auth/verify-email/", request, { token: body.token });
}
