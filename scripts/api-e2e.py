"""Exercise every backend operation through the Next.js frontend (BFF + auth routes).

Usage:  python scripts/api-e2e.py            (expects `npm run dev` on :3000)
        BASE=http://localhost:3000 python scripts/api-e2e.py

It creates a throwaway workspace and users, then prints their identifiers so they
can be removed. Registration is rate-limited per IP, so back-to-back runs may be
refused by the API — that is the limiter working, not a wiring failure.
"""
import json
import os
import http.cookiejar
import urllib.request
import urllib.error
import uuid

BASE = os.environ.get("BASE", "http://127.0.0.1:3000")
jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))

results = []


def call(method, path, body=None, headers=None, raw=None, expect=None, label=None):
    url = BASE + path
    data = None
    hdrs = {"accept": "application/json"}
    if body is not None:
        data = json.dumps(body).encode()
        hdrs["content-type"] = "application/json"
    if raw is not None:
        data, ctype = raw
        hdrs["content-type"] = ctype
    if headers:
        hdrs.update(headers)

    req = urllib.request.Request(url, data=data, headers=hdrs, method=method)
    try:
        with opener.open(req) as resp:
            status, payload = resp.status, resp.read()
    except urllib.error.HTTPError as exc:
        status, payload = exc.code, exc.read()

    try:
        parsed = json.loads(payload) if payload else None
    except json.JSONDecodeError:
        parsed = None

    ok = (status in expect) if expect else (200 <= status < 300)
    results.append((label or f"{method} {path}", status, ok))
    return status, parsed


def multipart(fields, filename, content, content_type="text/plain"):
    boundary = "----guardrail" + uuid.uuid4().hex
    parts = []
    for name, value in fields.items():
        parts.append(
            f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n".encode()
        )
    parts.append(
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{filename}\"\r\n"
        f"Content-Type: {content_type}\r\n\r\n".encode()
        + content
        + b"\r\n"
    )
    parts.append(f"--{boundary}--\r\n".encode())
    return b"".join(parts), f"multipart/form-data; boundary={boundary}"


email = f"e2e.{uuid.uuid4().hex[:8]}@example.com"
password = "Sup3rSecretPass!"

# ---- auth flows (Next route handlers) -------------------------------------
call("POST", "/api/auth/register", {"email": email, "password": password, "full_name": "E2E Runner"}, expect={201},
     label="POST /auth/register/")
call("POST", "/api/auth/login", {"email": email, "password": password}, expect={200}, label="POST /auth/login/")
call("GET", "/api/auth/me", expect={200}, label="GET /auth/me/")

# ---- tenant ---------------------------------------------------------------
status, org = call("POST", "/api/bff/organizations", {"name": "E2E Workspace", "timezone": "UTC"}, expect={201},
                   label="POST /organizations/")
org_id = org["id"]
call("POST", "/api/org/select", {"organizationId": org_id}, expect={204}, label="(session) org select")
call("GET", "/api/bff/organizations", expect={200}, label="GET /organizations/")
call("GET", f"/api/bff/organizations/{org_id}", expect={200}, label="GET /organizations/{id}/")
call("PATCH", f"/api/bff/organizations/{org_id}", {"name": "E2E Workspace HQ"}, expect={200},
     label="PATCH /organizations/{id}/")

# ---- members --------------------------------------------------------------
# Seeded users come from the database: registering twice from one IP trips the
# auth.register rate limit, which is correct behaviour and not what we test here.
member_email = os.environ.get("E2E_MEMBER_EMAIL", "admin@guardrail.local")
status, member = call("POST", f"/api/bff/organizations/{org_id}/members",
                      {"email": member_email, "role": "MEMBER"}, expect={201},
                      label="POST /organizations/{id}/members/")
if not member or "user_id" not in member:
    raise SystemExit(f"member create failed: {member}")
member_user_id = member["user_id"]
call("GET", f"/api/bff/organizations/{org_id}/members", expect={200}, label="GET /organizations/{id}/members/")
call("PATCH", f"/api/bff/organizations/{org_id}/members/{member_user_id}", {"role": "DEVELOPER"}, expect={200},
     label="PATCH /organizations/{id}/members/{user_id}/")
call("DELETE", f"/api/bff/organizations/{org_id}/members/{member_user_id}", expect={204},
     label="DELETE /organizations/{id}/members/{user_id}/")

# ---- assistants -----------------------------------------------------------
status, assistant = call("POST", "/api/bff/assistants",
                         {"name": "Concierge", "domain_type": "HOTEL", "allowed_topics": ["check-in", "breakfast"],
                          "system_instructions": "Answer front desk questions only."}, expect={201},
                         label="POST /assistants/")
aid = assistant["id"]
call("GET", "/api/bff/assistants", expect={200}, label="GET /assistants/")
call("GET", f"/api/bff/assistants/{aid}", expect={200}, label="GET /assistants/{id}/")
call("PATCH", f"/api/bff/assistants/{aid}", {"description": "Front desk helper"}, expect={200},
     label="PATCH /assistants/{id}/")
call("PUT", f"/api/bff/assistants/{aid}",
     {"name": "Concierge", "domain_type": "HOTEL", "allowed_topics": ["check-in", "breakfast"],
      "system_instructions": "Answer front desk questions only.", "fallback_message": "I can only help with hotel questions."},
     expect={200}, label="PUT /assistants/{id}/")
call("GET", f"/api/bff/assistants/{aid}/policy", expect={200}, label="GET /assistants/{id}/policy/")
call("PUT", f"/api/bff/assistants/{aid}/policy",
     {"allowed_topics": ["check-in", "breakfast"], "prohibited_topics": ["refunds"],
      "uncertainty_handling": "CLARIFY", "evaluator_mode": "RULES", "allow_threshold": 0.6, "clarify_threshold": 0.3,
      "response_constraints": {"max_chars": 1200, "banned_phrases": ["guarantee"], "block_pii": True},
      "escalation_rules": {"keywords": ["lawyer"], "message": "Let me pass this to a colleague."}},
     expect={200}, label="PUT /assistants/{id}/policy/")
call("POST", f"/api/bff/assistants/{aid}/evaluations",
     {"cases": [{"input": "What time is check-in?", "expected_decision": "ALLOW", "has_knowledge": True},
                {"input": "Can I get a refund?", "expected_decision": "REFUSE", "has_knowledge": True}]},
     expect={200}, label="POST /assistants/{id}/evaluations/")
call("POST", f"/api/bff/assistants/{aid}/activate", expect={200}, label="POST /assistants/{id}/activate/")
# The free plan allows one assistant, so duplicate either succeeds or is refused
# by the plan quota — both prove the route is wired and the limit is enforced.
status, duplicate = call("POST", f"/api/bff/assistants/{aid}/duplicate", expect={201, 403},
                         label="POST /assistants/{id}/duplicate/")
if status == 201 and duplicate and "id" in duplicate:
    call("POST", f"/api/bff/assistants/{duplicate['id']}/archive", expect={200},
         label="POST /assistants/{id}/archive/ (duplicate)")
call("GET", f"/api/bff/assistants/{aid}/usage", expect={200}, label="GET /assistants/{id}/usage/")

# ---- knowledge ------------------------------------------------------------
status, kb = call("POST", "/api/bff/knowledge-bases", {"name": "Guest policies", "description": "Check-in and breakfast"},
                  expect={201}, label="POST /knowledge-bases/")
kb_id = kb["id"]
call("GET", "/api/bff/knowledge-bases", expect={200}, label="GET /knowledge-bases/")
call("GET", f"/api/bff/knowledge-bases/{kb_id}", expect={200}, label="GET /knowledge-bases/{id}/")
raw = multipart({"title": "Guest policies"}, "guest.txt", b"Check-in starts at 15:00.\nBreakfast is 07:00-10:30.\n")
status, doc = call("POST", f"/api/bff/knowledge-bases/{kb_id}/documents", raw=raw, expect={202},
                   label="POST /knowledge-bases/{id}/documents/")
doc_id = doc["id"]
call("GET", f"/api/bff/knowledge-bases/{kb_id}/documents", expect={200}, label="GET /knowledge-bases/{id}/documents/")
call("GET", f"/api/bff/documents/{doc_id}", expect={200}, label="GET /documents/{id}/")
call("GET", f"/api/bff/documents/{doc_id}/status", expect={200}, label="GET /documents/{id}/status/")
call("POST", f"/api/bff/documents/{doc_id}/reprocess", expect={202}, label="POST /documents/{id}/reprocess/")
call("DELETE", f"/api/bff/documents/{doc_id}", expect={204}, label="DELETE /documents/{id}/")
status, kb2 = call("POST", "/api/bff/knowledge-bases", {"name": "Temp base"}, expect={201}, label="(seed) second base")
call("DELETE", f"/api/bff/knowledge-bases/{kb2['id']}", expect={204}, label="DELETE /knowledge-bases/{id}/")

# ---- api keys -------------------------------------------------------------
status, key = call("POST", "/api/bff/api-keys",
                   {"name": "E2E key", "environment": "DEVELOPMENT", "scopes": ["chat:write"]},
                   expect={201}, label="POST /api-keys/")
key_id = key["id"]
call("GET", "/api/bff/api-keys", expect={200}, label="GET /api-keys/")
call("GET", f"/api/bff/api-keys/{key_id}", expect={200}, label="GET /api-keys/{id}/")
call("POST", f"/api/bff/api-keys/{key_id}/rotate", expect={201}, label="POST /api-keys/{id}/rotate/")
call("POST", f"/api/bff/api-keys/{key_id}/revoke", expect={204}, label="POST /api-keys/{id}/revoke/")
status, key2 = call("POST", "/api/bff/api-keys", {"name": "E2E key 2", "scopes": ["chat:write"]},
                    expect={201}, label="(seed) second key")
call("DELETE", f"/api/bff/api-keys/{key2['id']}/revoke", expect={204}, label="DELETE /api-keys/{id}/revoke/")
status, key3 = call("POST", "/api/bff/api-keys", {"name": "E2E key 3", "scopes": ["chat:write"]},
                    expect={201}, label="(seed) third key")
# Deleting is a two-step flow: a live key must be revoked first (409 otherwise).
call("DELETE", f"/api/bff/api-keys/{key3['id']}", expect={409}, label="DELETE /api-keys/{id}/ (active → 409)")
call("POST", f"/api/bff/api-keys/{key3['id']}/revoke", expect={204}, label="(revoke before delete)")
call("DELETE", f"/api/bff/api-keys/{key3['id']}", expect={204}, label="DELETE /api-keys/{id}/ (revoked)")

# ---- chat + conversations -------------------------------------------------
idem = str(uuid.uuid4())
status, chat = call("POST", "/api/bff/chat/completions",
                    {"assistant_id": aid, "message": "What time is check-in?"},
                    headers={"idempotency-key": idem}, expect={200}, label="POST /chat/completions/")
conv_id = chat["conversation_id"]
call("GET", "/api/bff/conversations", expect={200}, label="GET /conversations/")
call("GET", f"/api/bff/conversations/{conv_id}", expect={200}, label="GET /conversations/{id}/")
call("GET", f"/api/bff/conversations/{conv_id}/messages", expect={200}, label="GET /conversations/{id}/messages/")
call("DELETE", f"/api/bff/conversations/{conv_id}", expect={204}, label="DELETE /conversations/{id}/")

# lifecycle tail: pause then archive the original assistant
call("POST", f"/api/bff/assistants/{aid}/pause", expect={200}, label="POST /assistants/{id}/pause/")
call("POST", f"/api/bff/assistants/{aid}/archive", expect={200}, label="POST /assistants/{id}/archive/")

# ---- usage + audit --------------------------------------------------------
call("GET", "/api/bff/usage/summary", expect={200}, label="GET /usage/summary/")
call("GET", "/api/bff/usage/by-assistant", expect={200}, label="GET /usage/by-assistant/")
call("GET", "/api/bff/usage/by-api-key", expect={200}, label="GET /usage/by-api-key/")
status, audit = call("GET", "/api/bff/audit-logs", expect={200}, label="GET /audit-logs/")
call("GET", f"/api/bff/audit-logs/{audit['results'][0]['id']}", expect={200}, label="GET /audit-logs/{id}/")

# ---- policies -------------------------------------------------------------
call("POST", "/api/bff/policies/evaluate-request",
     {"assistant_id": aid, "request_text": "Do you have a spa?"}, expect={200}, label="POST /policies/evaluate-request/")
call("POST", "/api/bff/policies/evaluate-response",
     {"assistant_id": aid, "request_text": "What time is check-in?",
      "proposed_response": "Check-in starts at 15:00 and we guarantee late checkout."},
     expect={200}, label="POST /policies/evaluate-response/")

# ---- session lifecycle ----------------------------------------------------
call("POST", "/api/auth/refresh", expect={200}, label="POST /auth/token/refresh/")
call("POST", "/api/auth/password-change", {"current_password": password, "new_password": "An0therSecretPass!"},
     expect={200}, label="POST /auth/password-change/")
call("POST", "/api/auth/login", {"email": email, "password": "An0therSecretPass!"}, expect={200},
     label="(re-login after password change)")
call("POST", "/api/auth/password-reset", {"email": email}, expect={202}, label="POST /auth/password-reset/")
call("POST", "/api/auth/password-reset/confirm", {"token": "invalid-token", "new_password": "YetAnotherPass123!"},
     expect={400}, label="POST /auth/password-reset/confirm/")
call("POST", "/api/auth/verify-email", {"token": "invalid-token"}, expect={400}, label="POST /auth/verify-email/")
call("POST", "/api/auth/verify-email/resend", expect={200}, label="POST /auth/verify-email/resend/")
call("POST", "/api/auth/deactivate", expect={202}, label="POST /auth/deactivate/")
call("POST", "/api/auth/logout", expect={204}, label="POST /auth/logout/")

# ---- ops endpoints (not proxied by the BFF on purpose) ---------------------
for ops_path, ops_label in [("/api/v1/health/", "GET /health/"), ("/api/v1/ready/", "GET /ready/")]:
    try:
        with urllib.request.urlopen(BASE.replace("3000", "8000") + ops_path) as resp:
            results.append((ops_label + " (direct)", resp.status, resp.status == 200))
    except Exception as exc:  # noqa: BLE001
        results.append((ops_label + " (direct)", getattr(exc, "code", 0), False))

passed = sum(1 for _, _, ok in results if ok)
print(f"{'STATUS':7} {'RESULT':7} OPERATION")
print("-" * 78)
for label, status, ok in results:
    print(f"{status:<7} {'PASS' if ok else 'FAIL':7} {label}")
print("-" * 78)
print(f"{passed}/{len(results)} passed")
failed = [(l, s) for l, s, ok in results if not ok]
if failed:
    print("FAILURES:")
    for label, status in failed:
        print("  ", status, label)

print(f"\ncreated workspace '{org_id}' and user '{email}' — delete them when done.")
