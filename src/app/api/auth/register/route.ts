import { NextResponse } from "next/server";

import { applySessionCookies, establishSession } from "@/lib/auth/session-server";
import { env } from "@/lib/env";

type RegisterBody = { email?: unknown; password?: unknown; full_name?: unknown };

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message, details: null, request_id: "" } }, { status });
}

/**
 * Register then immediately sign in.
 *
 * Django allows login before email verification, so the user lands in the
 * dashboard with a "verify your email" banner instead of a dead-end screen.
 */
export async function POST(request: Request) {
  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return jsonError(400, "invalid_body", "Send a JSON body.");
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";

  if (!email || !password) {
    return jsonError(400, "invalid_fields", "Email and password are required.");
  }

  const headers: Record<string, string> = { "content-type": "application/json", accept: "application/json" };
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) headers["x-forwarded-for"] = forwardedFor;

  const registerResponse = await fetch(`${env.apiBaseUrl}/api/v1/auth/register/`, {
    method: "POST",
    headers,
    body: JSON.stringify({ email, password, full_name: fullName }),
    cache: "no-store",
  });

  if (!registerResponse.ok) {
    return new NextResponse(await registerResponse.text(), {
      status: registerResponse.status,
      headers: { "content-type": registerResponse.headers.get("content-type") ?? "application/json" },
    });
  }

  const result = await establishSession({ email, password, forwardedFor });

  if (!result.ok) {
    // The account exists; surface the login failure instead of pretending success.
    return new NextResponse(result.body, {
      status: result.status,
      headers: { "content-type": result.contentType },
    });
  }

  const response = NextResponse.json(result.session, { status: 201 });
  applySessionCookies(response, {
    access: result.access,
    refresh: result.refresh,
    organizationId: result.session.organizationId,
  });
  return response;
}
