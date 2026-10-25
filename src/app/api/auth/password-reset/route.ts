import { NextResponse } from "next/server";

import { forwardPublicJson, readJson } from "@/lib/api/forward";

export async function POST(request: Request) {
  const body = await readJson<{ email?: string }>(request);
  if (!body?.email) {
    return NextResponse.json(
      { error: { code: "invalid_email", message: "An email address is required.", details: null, request_id: "" } },
      { status: 400 },
    );
  }

  return forwardPublicJson("/auth/password-reset/", request, { email: body.email.trim() });
}
